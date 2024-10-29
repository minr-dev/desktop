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
import { useTheme } from '@mui/material';
import * as menu from './menu';
import Help from './help/Help';

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
    text: menu.MENU_TIMELINE.name,
    link: menu.MENU_TIMELINE.path,
  },
  {
    text: menu.MENU_SETTING.name,
    link: menu.MENU_SETTING.path,
  },
  {
    text: menu.MENU_ACTIVITY_USAGE.name,
    link: menu.MENU_ACTIVITY_USAGE.path,
  },
  {
    text: menu.MENU_POMODORO_TIMER.name,
    link: menu.MENU_POMODORO_TIMER.path,
  },
  {
    text: menu.MENU_EVENTENTRY_CSV.name,
    link: menu.MENU_EVENTENTRY_CSV.path,
  },
];

const drawerWidth = 240;

const DrawerAppBar = (props: Props): JSX.Element => {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const theme = useTheme();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDrawerToggle: React.MouseEventHandler = (_event) => {
    setMobileOpen((prevState) => !prevState);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        <Button component={RouterLink} to={menu.MENU_TIMELINE.path}>
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

  const textColor =
    theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.contrastText;

  // ヘルプの表示・非表示の状態
  const [helpOpen, setHelpOpen] = React.useState(false);

  // ヘルプの表示
  const openHelp = (): void => {
    setHelpOpen(true);
  };

  // ヘルプの非表示
  const closeHelp = (): void => {
    setHelpOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar component="nav" sx={{ color: theme.palette.primary.contrastText }}>
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
            <Button component={RouterLink} to="/" sx={{ color: textColor }}>
              MINR
            </Button>
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((navItem) => (
              <Button
                key={navItem.link}
                component={RouterLink}
                to={navItem.link}
                sx={{ color: textColor }}
              >
                {navItem.text}
              </Button>
            ))}
            {/* ヘルプモーダルの表示ボタン */}
            <Button onClick={openHelp} sx={{ color: textColor }}>
              {menu.MENU_HELP.name}
            </Button>
            {helpOpen && <Help onClose={closeHelp} />}
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
