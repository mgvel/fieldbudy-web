import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Badge,
} from "@mui/material";
import {
  Close,
  Send,
  AttachFile,
  Download,
  Visibility,
  Delete,
  MoreVert,
} from "@mui/icons-material";
import { format } from "date-fns";
import axiosInstance from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import { Comment, FormDataType, UploadedFile } from "../../../types/forms";
import { Project } from "../../../types/type";
import { useAuthStore } from "../../../store/authStore";
import { API_BASE_URL } from "../../../api/config";
import formDetails from "../../../assets/data/formDetails";
import { ChevronRight } from "lucide-react";

interface CommentModalProps {
  open: boolean;
  fieldId: string;
  form?: FormDataType;
  project?: Project;
  onClose: () => void;
}

type Auth = {
  fullName: string;
  role: string;
  picture?: string;
  activationDate: string;
};

const CommentModal: React.FC<CommentModalProps> = ({
  open,
  fieldId,
  form,
  project,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<
    Array<{ id: string; username: string; fullName: string; role: string }>
  >([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [activeMentionIndex, setActiveMentionIndex] = useState(-1);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textFieldRef = useRef<HTMLInputElement>(null);

  const { User } = useAuthStore((state) => ({
    User: state.user,
  }));

  // Available users for mentions
  const availableUsers = React.useMemo(() => {
    const users = [];
    if (project?.fe) users.push({ ...project.fe, role: "FE" });
    if (project?.tw) users.push({ ...project.tw, role: "TW" });
    if (project?.qr) users.push({ ...project.qr, role: "QR" });
    if (project?.em) users.push({ ...project.em, role: "EM" });
    return users;
  }, [project]);

  const fetchComments = useCallback(async () => {
    if (!form?._id || !fieldId) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/comments`, {
        params: { form: form._id, fieldId },
      });
      setComments(response.data.payload || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [form?._id, fieldId]);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, fetchComments]);

  useEffect(() => {
    // Scroll to bottom when new comments are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [comments]);

  const handleMentionInput = useCallback(
    (value: string) => {
      const lastAtIndex = value.lastIndexOf("@");
      if (lastAtIndex !== -1) {
        const query = value.slice(lastAtIndex + 1);
        if (!query.includes(" ")) {
          setMentionQuery(query);
          const filtered = availableUsers.filter(
            (user) =>
              user.username.toLowerCase().includes(query.toLowerCase()) ||
              user.fullName.toLowerCase().includes(query.toLowerCase())
          );
          setMentionSuggestions(filtered);
          setShowMentions(filtered.length > 0);
          setActiveMentionIndex(-1);
        } else {
          setShowMentions(false);
        }
      } else {
        setShowMentions(false);
      }
    },
    [availableUsers]
  );

  const findFieldInfo = (fieldId:any) => {
    const dynamicMatch = fieldId.match(/^(.+?)-(\d+)$/);
    const baseFieldId = dynamicMatch ? dynamicMatch[1] : fieldId;
    const instanceNumber = dynamicMatch ? dynamicMatch[2] : null;

    for (const page of formDetails) {
      for (const field of page.title) {
        if (field.id === baseFieldId || field.id === fieldId) {
          return {
            parent: page.parent,
            child: instanceNumber
              ? `${field.name} #${instanceNumber}` 
              : field.name,
            isDynamic: !!instanceNumber,
          };
        }
      }
    }

    return {
      parent: "",
      child: fieldId,
      isDynamic: false,
    };
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showMentions) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveMentionIndex((prev) =>
            Math.min(prev + 1, mentionSuggestions.length - 1)
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveMentionIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && activeMentionIndex >= 0) {
          e.preventDefault();
          selectMention(mentionSuggestions[activeMentionIndex]);
        } else if (e.key === "Escape") {
          setShowMentions(false);
        }
      }
    },
    [showMentions, activeMentionIndex, mentionSuggestions]
  );

  const selectMention = useCallback(
    (user: any) => {
      const lastAtIndex = newComment.lastIndexOf("@");
      const newValue =
        newComment.substring(0, lastAtIndex + 1) + user.username + " ";
      setNewComment(newValue);
      setShowMentions(false);
      if (textFieldRef.current) {
        textFieldRef.current.focus();
      }
    },
    [newComment]
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSendComment = async () => {
    if (!newComment.trim() && !selectedFile) return;
    if (!form?._id) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("content", newComment.trim());
      formData.append("form", form._id);
      formData.append("fieldId", fieldId);

      // Extract mentions
      const mentionRegex = /@(\w+)/g;
      const mentions = [];
      let match;
      while ((match = mentionRegex.exec(newComment)) !== null) {
        mentions.push(match[1]);
      }

      const tags = availableUsers
        .filter((user) => mentions.includes(user.username))
        .map((user) => ({ userId: user._id, username: user.username }));

      formData.append("tags", JSON.stringify(tags));

      // Delivery list (all project users)
      const deliveredTo = availableUsers.map((user) => user._id);
      formData.append("deliveredTo", JSON.stringify(deliveredTo));
      formData.append("readBy", JSON.stringify([]));

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      await axiosInstance.post("/comments", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNewComment("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchComments();
      toast.success("Comment sent successfully");
    } catch (error) {
      console.error("Error sending comment:", error);
      toast.error("Failed to send comment");
    } finally {
      setIsSending(false);
    }
  };

  const renderCommentAttachment = (attachment: UploadedFile, id) => {
    const isImage = attachment.mimeType?.startsWith("image/");

    return (
      <Card sx={{ mt: 1, maxWidth: 300, borderRadius: 2 }}>
        <CardContent
          sx={{ p: 1.5, "&:last-child": { pb: 1.5, background: "#F5F5F5" } }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "end",
              gap: 1,
              backfaceVisibility: "hidden",
            }}
          >
            {isImage ? (
              <img
                src={`${API_BASE_URL}/comments/${id}/files/${encodeURIComponent(
                  attachment.filename
                )}`}
                alt={attachment.originalName}
                style={{ width: 1000, objectFit: "cover", borderRadius: 8 }}
                loading="lazy"
              />
            ) : (
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#F5F5F5",
                  borderRadius: 1,
                }}
              >
                <AttachFile />
              </Box>
            )}

            <Box>
              <IconButton
                size="small"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = attachment.url;
                  link.download =
                    attachment.originalName || attachment.filename;
                  link.click();
                }}
              >
                <Download fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderComment = (comment: Comment) => {
    const isOwnComment = comment.author === User?._id;
    const commentUser = availableUsers.find(
      (user) => user._id === comment.author
    );
    return (
      <Box
        key={comment._id}
        sx={{
          display: "flex",
          justifyContent: isOwnComment ? "flex-end" : "flex-start",
          mb: 2,
          px: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: "80%",
            display: "flex",
            flexDirection: isOwnComment ? "row-reverse" : "row",
            alignItems: "flex-start",
            gap: 1.5,
          }}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor:
                    commentUser?.role === "FE"
                      ? "#4CAF50"
                      : commentUser?.role === "TW"
                      ? "#2196F3"
                      : commentUser?.role === "QR"
                      ? "#FF9800"
                      : "#9C27B0",
                  border: "2px solid white",
                }}
              />
            }
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: isOwnComment ? "#1e51db" : "#757575",
                color: "white",
              }}
              src={commentUser?.picture}
            >
              {commentUser?.fullName?.charAt(0) || "U"}
            </Avatar>
          </Badge>

          <Box sx={{ maxWidth: "calc(100% - 60px)" }}>
            <Card
              sx={{
                backgroundColor: isOwnComment ? "#1e51db" : "#f5f5f5",
                color: isOwnComment ? "white" : "text.primary",
                borderRadius: 4,
                borderTopRightRadius: isOwnComment ? 4 : 16,
                borderTopLeftRadius: isOwnComment ? 16 : 4,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              <CardContent
                sx={{ p: 2, "&:last-child": { pb: 2 }, minWidth: "230px" }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                    gap: 2,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {comment.authorName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isOwnComment
                        ? "rgba(255,255,255,0.7)"
                        : "text.secondary",
                    }}
                  >
                    {format(new Date(comment.timestamp), "h:mm a")}
                  </Typography>
                </Box>

                <Typography variant="body2" sx={{ mb: 1 }}>
                  {comment.content.split(/(@\w+)/).map((part, index) => {
                    if (part.startsWith("@")) {
                      const username = part.slice(1);
                      const user = availableUsers.find(
                        (u) => u.username === username
                      );
                      return (
                        <Chip
                          key={index}
                          label={part}
                          size="small"
                          sx={{
                            backgroundColor: isOwnComment
                              ? "rgba(255,255,255,0.2)"
                              : "#E3F2FD",
                            color: isOwnComment ? "white" : "#1976D2",
                            fontSize: "0.75rem",
                            height: 20,
                            mx: 0.25,
                          }}
                        />
                      );
                    }
                    return part;
                  })}
                </Typography>

                {comment.attachments?.map((attachment) =>
                  renderCommentAttachment(attachment, comment._id)
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#1e51db",
          color: "white",
          py: 2,
          px: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Comments
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent:"center",
              gap:"1rem"
             
            }}
          >
            <Typography
              variant="subtitle2"
              className="flex"
              sx={{
                fontSize: "1rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {findFieldInfo(fieldId).parent}  <ChevronRight className="w-5"/>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: "1rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginLeft:"-15px"
              }}
            >
              {findFieldInfo(fieldId).child}
              {findFieldInfo(fieldId).isDynamic && (
                <Chip
                  label="Dynamic"
                  size="small"
                  sx={{
                    ml: 1,
                    height: 18,
                    fontSize: "0.6rem",
                    bgcolor: "rgba(255,255,255,0.2)",
                  }}
                />
              )}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "white", ml: 2 }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          p: 0,
          bgcolor: "#fafafa",
        }}
      >
        <Box
          ref={chatContainerRef}
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            backgroundImage:
              "linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\")",
          }}
        >
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          ) : comments.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <img
                src="/images/empty-comments.svg"
                alt="No comments"
                style={{ width: 150, opacity: 0.5, marginBottom: 16 }}
              />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No comments yet
              </Typography>
              <Typography variant="body2">
                Start the conversation by sending a message
              </Typography>
            </Box>
          ) : (
            comments.map(renderComment)
          )}
        </Box>

        {selectedFile && (
          <Box
            sx={{
              p: 2,
              backgroundColor: "#f0f4ff",
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AttachFile fontSize="small" color="primary" />
              <Typography variant="body2">{selectedFile.name}</Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setSelectedFile(null)}
              sx={{ color: "text.secondary" }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        )}

        {showMentions && (
          <Box
            sx={{
              position: "absolute",
              bottom: 120,
              left: 24,
              right: 24,
              backgroundColor: "white",
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              boxShadow: 3,
              maxHeight: 200,
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            {mentionSuggestions.map((user, index) => (
              <Box
                key={user._id}
                onClick={() => selectMention(user)}
                sx={{
                  p: 1.5,
                  cursor: "pointer",
                  backgroundColor:
                    index === activeMentionIndex ? "#f5f5f5" : "white",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor:
                      user.role === "FE"
                        ? "#4CAF50"
                        : user.role === "TW"
                        ? "#2196F3"
                        : user.role === "QR"
                        ? "#FF9800"
                        : "#9C27B0",
                  }}
                >
                  {user.fullName.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">{user.fullName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{user.username} • {user.role}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          pt: 0,
          borderTop: "1px solid #e0e0e0",
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: "100%",
            alignItems: "flex-end",
          }}
        >
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={isSending}
            sx={{
              bgcolor: "#f5f5f5",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            <AttachFile />
          </IconButton>

          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          <TextField
            inputRef={textFieldRef}
            fullWidth
            multiline
            maxRows={4}
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              handleMentionInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isSending}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 4,
                bgcolor: "#f5f5f5",
                "&:hover fieldset": {
                  borderColor: "#1e51db",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1e51db",
                },
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleSendComment}
            disabled={(!newComment.trim() && !selectedFile) || isSending}
            endIcon={
              isSending ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Send />
              )
            }
            sx={{
              bgcolor: "#1e51db",
              borderRadius: 4,
              px: 3,
              py: 1.5,
              "&:hover": {
                bgcolor: "#1541b0",
              },
              "&:disabled": {
                bgcolor: "#e0e0e0",
                color: "#9e9e9e",
              },
            }}
          >
            Send
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default CommentModal;
