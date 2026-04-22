export type DocumentItem = {
  id: number;
  title: string;
  description: string | null;
  file_type: string;
  file_size: number;
  created_at: string;
  tags: string | null;
  current_file_url: string;
  current_version: number;
};

export type ImageItem = {
  id: number;
  title: string;
  file_url: string;
  width: number | null;
  height: number | null;
  file_size: number;
  created_at: string;
  tags: string | null;
};

export type DocumentVersionItem = {
  id: number;
  document_id: number;
  version_num: number;
  file_url: string;
  public_id: string;
  file_size: number;
  change_note: string | null;
  created_at: string;
};
