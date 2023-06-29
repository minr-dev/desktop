import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

interface NavItem {
  text: string;
  link: string;
}

const navItems: NavItem[] = [
  {
    text: 'Preference',
    link: '/preference',
  },
  {
    text: 'Account',
    link: '/account',
  },
];

const drawerWidth = 240;

const DrawerAppBar: React.FC = (props: Props) => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDrawerToggle: React.MouseEventHandler = (_event) => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <Button component={RouterLink} to="/">
          MINR
        </Button>
      </Typography>
      <Divider />
      <List>
        {navItems.map((navItem) => (
          <ListItem key={navItem.link} disablePadding>
            <ListItemButton component={RouterLink} to={navItem.link} sx={{ textAlign: 'center' }}>
              <ListItemText primary={navItem.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  let container: Element | null = null;
  if (window !== undefined) {
    container = window().document.body;
  }
  // const container = typeof window !== "undefined" ? () => window.document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            <Button component={RouterLink} to="/">
              MINR
            </Button>
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((navItem) => (
              <Button
                key={navItem.link}
                component={RouterLink}
                to={navItem.link}
                sx={{ color: '#fff' }}
              >
                {navItem.text}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
};

export default DrawerAppBar;
