const useModal = (): { isOpen: boolean; open: () => void; close: () => void } => ({
  isOpen: false,
  open: (): void => {},
  close: (): void => {},
});

export default useModal;
