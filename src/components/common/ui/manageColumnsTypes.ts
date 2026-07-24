export type ManageColumnConfig = {
  id: string;
  label: string;
  /** Always visible; checkbox disabled */
  pinned?: boolean;
  /** Included in "Reset to default" selection */
  defaultVisible?: boolean;
};

export type ManageColumnsDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  columns: ManageColumnConfig[];
  /** Currently applied visible column ids */
  selectedColumnIds: string[];
  /** Applied when user clicks Confirm */
  onConfirm: (selectedColumnIds: string[]) => void;
  searchPlaceholder?: string;
};
