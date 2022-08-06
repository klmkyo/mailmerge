import { Box, CircularProgress } from "@mui/material"
import { FC } from "react"

export const Loading = () => {
  return(
    <Box sx={{ width: '100%' }}>
      <CircularProgress />
    </Box>
  )
}