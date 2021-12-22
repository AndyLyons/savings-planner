import { Paper } from "@mui/material";
import { PeopleEdit } from "./PeopleEdit";

export function Body() {
    return (
        <Paper sx={{ m: 2, p: 2 }}>
            <PeopleEdit />
        </Paper>
    )
}