import React from "react";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

export interface ButtonProps
  extends Omit<MuiButtonProps, "variant" | "color" | "size" | "fullWidth"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  color?: MuiButtonProps["color"] | string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  color = "primary",      // ⬅️ new prop with default
  children,
  sx,
  ...muiProps
}) => {
  const muiVariant: MuiButtonProps["variant"] =
    variant === "outline" ? "outlined" : variant === "ghost" ? "text" : "contained";
  const muiSize: MuiButtonProps["size"] =
    size === "sm" ? "small" : size === "lg" ? "large" : "medium";
  const startIcon = isLoading ? (
    <CircularProgress size={16} color="inherit" />
  ) : (
    leftIcon
  );

  const endIcon = !isLoading ? rightIcon : undefined;

  // ─── Pass palette key directly; otherwise override via sx ────────────────
  const paletteKeys = [
    "inherit",
    "primary",
    "secondary",
    "error",
    "info",
    "success",
    "warning",
  ] as const;

  const isPaletteKey = (value: string): value is MuiButtonProps["color"] =>
    (paletteKeys as readonly string[]).includes(value);

  const paletteColor = isPaletteKey(color) ? color : undefined;

  return (
    <MuiButton
      variant={muiVariant}
      color={paletteColor}       // undefined when using a raw CSS color
      size={muiSize}
      fullWidth={fullWidth}
      disabled={disabled || isLoading}
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        textTransform: "none",
        // Only add custom background if the color isn't a palette key
        ...(isPaletteKey(color)
          ? {}
          : {
              backgroundColor: color,
              "&:hover": { backgroundColor: color },
            }),
        ...sx,                  // allow caller to layer on more custom styles
      }}
      {...muiProps}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
