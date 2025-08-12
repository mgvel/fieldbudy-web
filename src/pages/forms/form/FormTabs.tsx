import React, { useState, useCallback, useMemo } from "react";
import {
  Tab,
  Tabs,
  Box,
  Typography,
  Paper,
  styled,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Button,
} from "@mui/material";
import {
  ChevronRight,
  Save,
  ExpandMore,
  Delete,
} from "@mui/icons-material";
import FormField from "./FormField";
import { FormPage, FormSection, FormCounts } from "../../../types/forms";
import { Plus } from "lucide-react";
import DamageSection from "./DamageSection";

interface AdvancedFormTabsProps {
  pages: FormPage[];
  activeTab: string;
  responses: Record<string, any>;
  readOnly: boolean;
  isSaving: boolean;
  counts: FormCounts;
  onTabChange: (newValue: string) => void;
  onInputChange: (fieldId: string, value: any) => void;
  onOpenChat: (fieldId: string) => void;
  onOpenGallery: (fieldId: string) => void;
  saveCurrentVersion:()=>void;
  onUpdateCounts: (newCounts: FormCounts) => void;
  project: string;
  versionName: string;
  hasUnsavedChanges:boolean
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    backgroundColor: "#3B82F6",
    height: 3,
  },
  minHeight: 48,
}));

const StyledTab = styled(Tab)<{ color?: string }>(({ theme, color }) => ({
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.875rem",
  color: "#6B7280",
  padding: "12px 20px",
  minHeight: 48,
  "&.Mui-selected": {
    color: color || "#3B82F6",
    fontWeight: 600,
  },
}));

const SectionAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  "&:before": {
    display: "none",
  },
  border: "1px solid #E5E7EB",
  borderRadius: "8px !important",
  "&.Mui-expanded": {
    margin: `0 0 ${theme.spacing(2)}px 0`,
  },
}));

const FormTabs: React.FC<AdvancedFormTabsProps> = ({
  pages,
  activeTab,
  responses,
  readOnly,
  isSaving,
  counts,
  onTabChange,
  onInputChange,
  onOpenChat,
  onOpenGallery,
  saveCurrentVersion,
  onUpdateCounts,
  project,
  versionName,
  hasUnsavedChanges
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      onTabChange(newValue);
    },
    [onTabChange]
  );

  const handleNext = useCallback(() => {
    const currentIndex = pages.findIndex((p) => p.id === activeTab);
    const nextTab = pages[currentIndex + 1]?.id || pages[0]?.id;
    if (nextTab) onTabChange(nextTab);
  }, [pages, activeTab, onTabChange]);

  const handleSectionToggle = useCallback((sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  }, []);

  const handleAddSection = useCallback(
    (sectionType: keyof FormCounts, increment: number = 1) => {
      const newCounts = { ...counts };
      if (sectionType === "damageCounts") {
        // Add damage to specific room
        newCounts.damageCounts = [...counts.damageCounts];
        newCounts.damageCounts[increment] =
          (newCounts.damageCounts[increment] || 0) + 1;
      } else {
        newCounts[sectionType] = (counts[sectionType] as number) + increment;
      }
      onUpdateCounts(newCounts);
    },
    [counts, onUpdateCounts]
  );

  const handleRemoveSection = useCallback(
    (sectionType: keyof FormCounts, index?: number) => {
      const newCounts = { ...counts };
      if (sectionType === "damageCounts" && typeof index === "number") {
        newCounts.damageCounts = [...counts.damageCounts];
        newCounts.damageCounts[index] = Math.max(
          0,
          (newCounts.damageCounts[index] || 0) - 1
        );
      } else if (typeof newCounts[sectionType] === "number") {
        newCounts[sectionType] = Math.max(
          1,
          (counts[sectionType] as number) - 1
        );
      }
      onUpdateCounts(newCounts);
    },
    [counts, onUpdateCounts]
  );

  const renderMultipleSections = useCallback(
    (
      section: FormSection,
      pageId: string,
      count: number,
      sectionType: keyof FormCounts
    ) => {
      const sections = [];

      for (let i = 1; i <= count; i++) {
        const sectionId = `${section.id}-${i}`;
        const isExpanded = expandedSections.includes(sectionId);

        sections.push(
          <SectionAccordion
            key={sectionId}
            expanded={isExpanded}
            onChange={() => handleSectionToggle(sectionId)}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: "#F9FAFB",
                borderBottom: "1px solid #E5E7EB",
                "&.Mui-expanded": {
                  borderBottom: "1px solid #E5E7EB",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  pr: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 500, fontSize: "15px" }}
                >
                  {section.title} #{i}
                </Typography>
                {i > 1 && !readOnly && (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSection(sectionType);
                    }}
                    sx={{ color: "#EF4444" }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3 }}>
              {section.fields.map((field) => (
                <FormField
                  key={`${field.id}-${i}`}
                  field={{
                    ...field,
                    id: `${field.id}-${i}`,
                  }}
                  value={responses[`${field.id}-${i}`] || field.value || ""}
                  readOnly={readOnly}
                  onInputChange={onInputChange}
                  onOpenChat={onOpenChat}
                  onOpenGallery={onOpenGallery}
                  projectId={project}
                />
              ))}

              {/* Special handling for room sections to include damages */}
              {section.id === "section-room" && (
                <DamageSection
                  roomIndex={i - 1}
                  damageCount={counts.damageCounts[i - 1] || 1}
                  responses={responses}
                  readOnly={readOnly}
                  onInputChange={onInputChange}
                  onOpenChat={onOpenChat}
                  onAddDamage={() => handleAddSection("damageCounts", i - 1)}
                  onRemoveDamage={() =>
                    handleRemoveSection("damageCounts", i - 1)
                  }
                />
              )}
            </AccordionDetails>
          </SectionAccordion>
        );
      }

      return sections;
    },
    [
      expandedSections,
      handleSectionToggle,
      readOnly,
      handleRemoveSection,
      responses,
      onInputChange,
      onOpenChat,
      counts.damageCounts,
      handleAddSection,
      handleRemoveSection,
      project,
    ]
  );

  const renderSection = useCallback(
    (section: FormSection, pageId: string) => {
      switch (section.id) {
        case "section-structure":
          return (
            <Box key={section.id}>
              <Typography
                variant="h6"
                sx={{
                  color: "#3B82F6",
                  fontWeight: 600,
                  mb: 0,
                  fontSize: "15px",
                }}
              >
                Structures
              </Typography>
              {renderMultipleSections(
                section,
                pageId,
                counts.structureCount,
                "structureCount"
              )}
              {!readOnly && (
                <Button
                  variant="outlined"
                  startIcon={<Plus />}
                  onClick={() => handleAddSection("structureCount")}
                  sx={{ mt: 2 }}
                >
                  Add Structure
                </Button>
              )}
            </Box>
          );

        case "section-interviewee":
          return (
            <Box key={section.id}>
              {renderMultipleSections(
                section,
                pageId,
                counts.intervieweeCount,
                "intervieweeCount"
              )}
              {!readOnly && (
                <Button
                  variant="outlined"
                  startIcon={<Plus />}
                  onClick={() => handleAddSection("intervieweeCount")}
                  sx={{ mt: 2 }}
                >
                  Add Interviewee
                </Button>
              )}
            </Box>
          );

        case "section-document":
          return (
            <Box key={section.id}>
              {renderMultipleSections(
                section,
                pageId,
                counts.documentCount,
                "documentCount"
              )}
              {!readOnly && (
                <Button
                  variant="outlined"
                  startIcon={<Plus />}
                  onClick={() => handleAddSection("documentCount")}
                  sx={{ mt: 2 }}
                >
                  Add Document
                </Button>
              )}
            </Box>
          );

        case "section-room":
          return (
            <Box key={section.id}>
              <Typography
                variant="h6"
                sx={{
                  color: "#3B82F6",
                  fontWeight: 600,
                  mb: 0,
                  fontSize: "15px",
                }}
              >
                Room / Area
              </Typography>
              {renderMultipleSections(
                section,
                pageId,
                counts.roomCount,
                "roomCount"
              )}
              {!readOnly && (
                <Button
                  variant="outlined"
                  startIcon={<Plus />}
                  onClick={() => handleAddSection("roomCount")}
                  sx={{ mt: 2 }}
                >
                  Add Room / Area
                </Button>
              )}
            </Box>
          );

        case "interview-structure":
          return (
            <Box key={section.id}>
              <Typography
                variant="h6"
                sx={{
                  color: "#3B82F6",
                  fontWeight: 600,
                  mb: 0,
                  fontSize: "15px",
                }}
              >
                Structures
              </Typography>
              {renderMultipleSections(
                section,
                pageId,
                counts.structureCount,
                "structureCount"
              )}
            </Box>
          );

        default:
          // Regular section
          return (
            <Box key={section.id} sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#3B82F6",
                  fontWeight: 600,
                  mb: 0,
                  fontSize: "15px",
                }}
              >
                {section.title}
              </Typography>
              {section.fields.map((field) => (
                <FormField
                  key={field.id}
                  field={field}
                  value={responses[field.id] || field.value || ""}
                  readOnly={readOnly}
                  onInputChange={onInputChange}
                  onOpenChat={onOpenChat}
                  onOpenGallery={onOpenGallery}
                  projectId={project}
                />
              ))}
            </Box>
          );
      }
    },
    [
      renderMultipleSections,
      counts,
      handleAddSection,
      readOnly,
      responses,
      onInputChange,
      onOpenChat,
      onOpenGallery,
      project,
    ]
  );

  const currentPage = useMemo(
    () => pages.find((p) => p.id === activeTab),
    [pages, activeTab]
  );

  const isEditable = useMemo(
    () =>
      !readOnly &&
      ["IDP In Progress - By FE", "IDP Not Started"].includes(
        currentPage?.title || ""
      ),
    [readOnly, currentPage?.title]
  );

  const shouldShowButton =
    versionName === "IDP Not Started" ||
    versionName === "IDP In Progress - By FE";

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid #E5E7EB", borderRadius: 2, overflow: "hidden",marginBottom:"3rem" }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "#F9FAFB",
        }}
      >
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {pages.map((page) => (
            <StyledTab
              key={page.id}
              label={page.title}
              value={page.id}
              color={page.color}
            />
          ))}
        </StyledTabs>
      </Box>

      <Box sx={{ p: 3, maxHeight: "calc(100vh - 200px)", overflow: "auto",}}>
        {pages.map((page) => (
          <div
            key={page.id}
            role="tabpanel"
            hidden={activeTab !== page.id}
            id={`tabpanel-${page.id}`}
            aria-labelledby={`tab-${page.id}`}
          >
            {activeTab === page.id && (
              <Box >
                {page.section.map((section) => renderSection(section, page.id))}
              </Box>
            )}
          </div>
        ))}
      </Box>
      <div className="flex justify-center">
        <div className="fixed bottom-1 py-2 rounded-xl bg-[#eee] flex justify-center items-center px-5 gap-3">
        {shouldShowButton && (
          <Button
            variant="outlined"
            size="small"
            endIcon={<ChevronRight />}
            onClick={handleNext}
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              borderColor: "gray",
              color: "gray",
              "&:hover": {
                borderColor: "blue",
                color: "blue",
              },
            }}
          >
            Next
          </Button>
        )}

          {shouldShowButton && (
            <Button
              variant="contained"
              size="small"
              startIcon={
                isSaving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Save />
                )
              }
              onClick={saveCurrentVersion}
              disabled={isSaving}
              sx={{
                px: 4,
                py: 1,
                borderRadius: 2,
                backgroundColor: "#1e51db",
                "&:hover": {
                  backgroundColor: "#2563EB",
                },
              }}
            >
              {isSaving ? "Saving..." : "Save in Current Version"}
            </Button>
          )}
        </div>
      </div>
    </Paper>
  );
};

export default FormTabs;
