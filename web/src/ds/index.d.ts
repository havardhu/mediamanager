// Types for the generated Workbench design-system module (index.js).
import type { CSSProperties, ReactNode, ChangeEvent, KeyboardEvent, MouseEvent, FC, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from 'react';

export type IconName = string;
export type Status = 'ready' | 'pending' | 'error' | 'live' | '';

export declare const Icon: FC<{ name: IconName; size?: number; strokeWidth?: number; color?: string; style?: CSSProperties; className?: string }>;
export declare const iconNames: string[];

type BtnBase = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
};

export declare const Button: FC<BtnBase & {
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  active?: boolean;
  size?: 'md' | 'sm' | 'xs';
  icon?: IconName | ReactNode;
  iconSize?: number;
  wide?: boolean;
  children?: ReactNode;
}>;

export declare const IconButton: FC<BtnBase & {
  icon: IconName;
  label: string;
  size?: 'md' | 'sm';
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  iconSize?: number;
}>;

export declare const Badge: FC<{ children?: ReactNode; tone?: 'default' | 'accent' | 'error'; style?: CSSProperties }>;
export declare const Eyebrow: FC<{ children?: ReactNode; style?: CSSProperties }>;
export declare const Hint: FC<{ children?: ReactNode; strong?: boolean; style?: CSSProperties }>;
export declare const SectionHeading: FC<{ children?: ReactNode; trailing?: ReactNode; flush?: boolean; style?: CSSProperties }>;
export declare const Separator: FC<{ size?: 'command' | 'title'; style?: CSSProperties }>;
export declare const StatusDot: FC<{ status?: Status; label?: string; style?: CSSProperties }>;

export declare const SidebarTabs: FC<{ tabs: { id: string; label: string; icon?: IconName }[]; value: string; onChange: (id: string) => void }>;
export declare const TreeGroup: FC<{ icon?: IconName; label: ReactNode; count?: ReactNode; expanded?: boolean; onToggle?: () => void }>;
export declare const TreeItem: FC<{ icon?: IconName; label: string; selected?: boolean; error?: boolean; onClick?: () => void; onDoubleClick?: () => void; title?: string }>;

export declare const EmptyState: FC<{ icon?: IconName; title?: ReactNode; children?: ReactNode }>;
export declare const InlineStatus: FC<{ children?: ReactNode; icon?: IconName; actionLabel?: string; onAction?: () => void }>;
export declare const Notification: FC<{ tone?: 'info' | 'error'; children?: ReactNode; onDismiss?: () => void; style?: CSSProperties }>;
export declare const Progress: FC<{ value?: number; max?: number; label?: ReactNode; bare?: boolean; onCancel?: () => void; cancelLabel?: string }>;
export declare const SummaryCard: FC<{ title?: ReactNode; lines?: ReactNode[]; children?: ReactNode; style?: CSSProperties }>;

export declare const Checkbox: FC<Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
  label?: ReactNode;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  count?: ReactNode;
  color?: string;
  style?: CSSProperties;
}>;
export declare const Field: FC<{ label?: ReactNode; children?: ReactNode; size?: 'md' | 'sm'; style?: CSSProperties }>;
export declare const FieldPair: FC<{ children?: ReactNode; style?: CSSProperties }>;
export declare const SearchBox: FC<{ value: string; onChange: (v: string) => void; placeholder?: string; label?: string; style?: CSSProperties }>;
export declare const Select: FC<SelectHTMLAttributes<HTMLSelectElement> & {
  options?: (string | { value: string; label: string })[];
  size?: 'md' | 'sm';
  style?: CSSProperties;
}>;
export declare const TextInput: FC<InputHTMLAttributes<HTMLInputElement> & {
  mono?: boolean;
  invalid?: boolean;
  style?: CSSProperties;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
}>;

export declare const Modal: FC<{
  title?: ReactNode;
  eyebrow?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  width?: number | string;
  gap?: number;
  closeButton?: boolean;
  inline?: boolean;
  onSubmit?: () => void;
}>;
export declare const ButtonRow: FC<{ children?: ReactNode; align?: 'end' | 'between'; fill?: boolean; style?: CSSProperties }>;

export declare const CommandBar: FC<{ children?: ReactNode; label?: string; style?: CSSProperties }>;
export declare const Spacer: FC<{}>;
export declare const StatusBar: FC<{ children?: ReactNode; style?: CSSProperties }>;
export declare const StatusItem: FC<{ children?: ReactNode; grow?: boolean }>;
export declare const Titlebar: FC<{ icon?: IconName; title?: ReactNode; context?: ReactNode; dirty?: boolean; tag?: ReactNode; trailing?: ReactNode; style?: CSSProperties }>;
export declare const Toolbar: FC<{ children?: ReactNode; label?: string; style?: CSSProperties }>;
export declare const ToolButton: FC<{ icon: IconName; label: string; active?: boolean; showLabel?: boolean; disabled?: boolean; onClick?: () => void; title?: string }>;
export declare const CoordinateBadge: FC<{ children?: ReactNode }>;
