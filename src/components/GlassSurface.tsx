import { Paper, type PaperProps } from "@mui/material";
import { forwardRef } from "react";

type Props = PaperProps & { radius?: number };

/**
 * Frosted-glass surface. Uses backdrop-filter; the `.glass` CSS class in
 * styles.css provides the @supports fallback for older WebViews.
 */
export const GlassSurface = forwardRef<HTMLDivElement, Props>(
  ({ radius = 24, sx, className, ...rest }, ref) => {
    return (
      <Paper
        ref={ref}
        elevation={0}
        className={["glass", className].filter(Boolean).join(" ")}
        sx={{
          borderRadius: `${radius}px`,
          border: "1px solid rgba(255,255,255,0.08)",
          color: "text.primary",
          ...sx,
        }}
        {...rest}
      />
    );
  },
);
GlassSurface.displayName = "GlassSurface";
