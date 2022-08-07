import { Box, CircularProgress } from "@mui/material"

export const Loading = () => {
  return(
    <Box sx={{ width: '100%' }}>
      <CircularProgress />
    </Box>
  )
}