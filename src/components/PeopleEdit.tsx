import { Box, Typography } from "@mui/material";
import { AppState, useStore } from "../state/store";

const getNumPeople = (state: AppState) => state.peopleIds.length
const getPeople = (state: AppState) => state.people

export function PeopleEdit() {
    const numPeople = useStore(getNumPeople)

    return (
        <Box>
            <Typography variant='h6' component='h2'>People</Typography>
            {numPeople === 0 ? <Typography>...no people yet</Typography> : null}
        </Box>
    )
}