import { Box, CircularProgress } from "@mui/material"

export const Loading = () => {
  return(
    <Box sx={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
      <CircularProgress />
    </Box>
  )
}
