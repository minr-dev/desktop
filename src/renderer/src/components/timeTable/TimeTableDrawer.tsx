import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Button,
  Drawer,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

export interface TimeTableMenuItem {
  text: string;
  icon?: JSX.Element;
  action: () => void;
}

export interface TimeTableDrawerProps {
  items: TimeTableMenuItem[];
}

export const TimeTableDrawer = ({ items }: TimeTableDrawerProps): JSX.Element => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <Button onClick={(): void => setOpen(true)}>
        <MenuIcon />
      </Button>
      <Drawer open={isOpen} anchor="right" onClose={(): void => setOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={(): void => setOpen(false)}>
          <List>
            {items.map(({ text, icon, action }, index) => (
              <ListItem key={index} disablePadding>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemButton onClick={action}>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};
