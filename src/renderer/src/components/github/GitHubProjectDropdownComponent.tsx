import { AutorenewRounded } from '@mui/icons-material';
import { Box, Button, FormHelperText, MenuItem, TextField } from '@mui/material';
import { useGitHubAuth } from '@renderer/hooks/useGitHubAuth';
import { useGitHubProjectV2Map } from '@renderer/hooks/useGitHubProjectV2Map';
import { useGitHubProjectV2Sync } from '@renderer/hooks/useGitHubProjectV2Sync';
import { useEffect, useState } from 'react';

/**
 * GitHubProjectDropdownComponent のプロパティを定義するインターフェイス
 *
 * @property {Function} onChange - GitHubプロジェクトが選択されたときに呼び出される関数。
 * @property {string | null} [value] - 初期値または外部から制御される値。オプショナル。
 */
interface GitHubProjectDropdownComponentProps {
  onChange: (value: string) => void;
  value?: string | null;
}

/**
 * GitHubプロジェクト選択用のドロップダウンコンポーネント
 *
 * GitHubプロジェクトの一覧を取得して、プルダウンに表示する。
 * アプリ側ではデータの作成を行わないため、GitHubから最新データを取得するボタンを表示する。
 *
 * @param {GitHubProjectDropdownComponentProps} props - コンポーネントのプロパティ。
 * @returns {JSX.Element} レンダリング結果。
 */
export const GitHubProjectDropdownComponent = ({
  onChange,
  value,
}: GitHubProjectDropdownComponentProps): JSX.Element => {
  const { gitHubProjectV2Map, refresh, isLoading } = useGitHubProjectV2Map();
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
  const handleUpdate = async (): Promise<void> => {
    // memo: GitHubの組織を基に更新を行うので、組織の同期も実行する。
    await syncOrganization();
    await syncGitHubProjectV2();
    refresh();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const sorted = Array.from(gitHubProjectV2Map.values()).sort((a, b) => {
    return a.title.localeCompare(b.title);
  });

  return (
    <>
      <TextField
        select
        label="GitHubプロジェクト"
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
