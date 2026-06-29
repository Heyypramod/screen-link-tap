import { createFileRoute } from "@tanstack/react-router";
import { Box, Typography } from "@mui/material";
import { Cast } from "lucide-react";

export const Route = createFileRoute("/cast")({
  head: () => ({
    meta: [
      { title: "Cast — TV Remote" },
      { name: "description", content: "Cast media to your TV." },
    ],
  }),
  component: CastPage,
});

function CastPage() {
  return (
    <Box sx={{ minHeight: "100vh", color: "text.primary", pb: "80px" }}>
      <Box sx={{ maxWidth: 440, mx: "auto", px: 2, pt: 6 }}>
        <Typography component="h1" className="text-large-title" sx={{ mb: 3 }}>
          Cast
        </Typography>
        <Box
          className="material-regular corner-continuous"
          sx={{
            borderRadius: "var(--radius-md)",
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
            textAlign: "center",
          }}
        >
          <Cast size={32} color="var(--label-secondary)" strokeWidth={1.8} />
          <Typography className="text-headline">Casting coming soon</Typography>
          <Typography className="text-subheadline" sx={{ color: "var(--label-secondary)" }}>
            For now this app works as a remote control. Cast support is planned for a future
            release.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
