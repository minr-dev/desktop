import { AutorenewRounded } from '@mui/icons-material';
import { Box, Button, FormHelperText, MenuItem, TextField } from '@mui/material';
import { useGitHubAuth } from '@renderer/hooks/useGitHubAuth';
import { useGitHubProjectMap } from '@renderer/hooks/useGitHubProjectMap';
import { useGitHubProjectV2Sync } from '@renderer/hooks/useGitHubProjectV2Sync';
import { useEffect, useState } from 'react';

interface GitHubProjectDropdownComponentProps {
  onChange: (value: string) => void;
  value?: string | null;
}

export const GitHubProjectDropdownComponent = ({
  onChange,
  value,
}: GitHubProjectDropdownComponentProps): JSX.Element => {
  const { gitHubProjectMap, refresh, isLoading } = useGitHubProjectMap();
  const [selectedValue, setSelectedValue] = useState<string | undefined | null>(value || '');
  const { isAuthenticated: isGitHubAuthenticated } = useGitHubAuth();
  const { syncGitHubProjectV2, syncOrganization } = useGitHubProjectV2Sync();

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  // ドロップダウンの値が選択変更されたイベント
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedValue(e.target.value);
    onChange(e.target.value);
  };

  // リストの更新ボタンのクリックイベント
  const handleUpdate = (): void => {
    syncOrganization();
    syncGitHubProjectV2();
    refresh();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const sorted = Array.from(gitHubProjectMap.values()).sort((a, b) => {
    return a.title.localeCompare(b.title);
  });

  return (
    <>
      <TextField
        select
        label="GITHUB プロジェクト"
        value={selectedValue}
        onChange={handleChange}
        variant="outlined"
        fullWidth
        disabled={!isGitHubAuthenticated}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              style: {
                maxHeight: '20rem',
              },
            },
          },
        }}
      >
        <MenuItem>
          <em>プロジェクトなし</em>
        </MenuItem>
        {sorted.map((project) => (
          <MenuItem key={project.id} value={project.id}>
            {project.title}
          </MenuItem>
        ))}
        <Box borderTop={1}>
          <Button variant="text" color="primary" onClick={handleUpdate}>
            <AutorenewRounded sx={{ marginRight: '0.5rem' }} />
            リストを最新版に更新する
          </Button>
        </Box>
      </TextField>
      {!isGitHubAuthenticated && (
        <FormHelperText>変更する場合は、GitHubの同期を行ってください。</FormHelperText>
      )}
    </>
  );
};
