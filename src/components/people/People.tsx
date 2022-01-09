import { Route, Routes } from "react-router-dom";
import { Box, List, Typography } from "@mui/material";
import { useSelector } from "../../state/app";
import { CreatePersonListItem } from "./CreatePersonListItem";
import { EditPersonListItem } from "./EditPersonListItem";
import { PersonListItem } from "./PersonListItem";
import { FooterListItem } from "./FooterListItem";

export function People() {
    const peopleIds = useSelector(state => state.peopleIds, [])

    return (
        <Box>
            <Typography variant='h6' component='h2'>People</Typography>
            <List>
                {peopleIds.map(id => (
                    <Routes key={id}>
                        <Route path='*' element={<PersonListItem id={id} />} />
                        <Route path={`${id}`} element={<EditPersonListItem id={id} />} />
                    </Routes>
                ))}
                <Routes>
                    <Route path='*' element={<FooterListItem />} />
                    <Route path='add' element={<CreatePersonListItem />} />
                </Routes>
            </List>
        </Box>
    )
}