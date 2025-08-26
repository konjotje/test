


import React from 'react';

// Generic Icon Props for Material Symbols
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  // children prop is implicitly the icon name string for Material Symbols
  filled?: boolean; // Optional: to use the filled version of an icon
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700; // Optional: font weight
}

const MaterialSymbol: React.FC<IconProps & { iconName: string }> = ({ 
  className, 
  iconName, 
  filled,
  weight, // Weight prop can override default or CSS-set weight
  style,
  ...props 
}) => {
  const fontVariationSettings: React.CSSProperties = {};
  // Start with default FILL 0 unless 'filled' prop is true
  let settings = filled ? ["'FILL' 1"] : ["'FILL' 0"];
  if (weight) {
    settings.push(`'wght' ${weight}`);
  }
  // Other settings like GRAD, opsz can be added if needed, or rely on CSS defaults
  if (settings.length > 0) {
    fontVariationSettings.fontVariationSettings = settings.join(', ');
  }

  return (
    <span 
      className={`material-symbols-rounded text-brand-accent ${className || ''}`}
      aria-hidden="true"
      style={{ ...fontVariationSettings, ...style }}
      {...props}
    >
      {iconName}
    </span>
  );
};

export const SunIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="light_mode" {...props} />;
export const MoonIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="dark_mode" {...props} />;
export const CreditCardIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="credit_card" {...props} />;
export const ChartBarIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="bar_chart" {...props} />;
export const CurrencyDollarIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="payments" {...props} />;
export const PlusCircleIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="add_circle" {...props} />;
export const PencilIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="edit" {...props} />;
export const TrashIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="delete" {...props} />;
export const CheckCircleIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="check_circle" {...props} />;
export const XCircleIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="cancel" {...props} />;
export const XIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="close" {...props} />;
export const ChevronDownIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="expand_more" {...props} />;
export const InformationCircleIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="info" {...props} />;
export const CogIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="settings" {...props} />;
export const CalendarDaysIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="calendar_month" {...props} />;
export const BellAlertIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="notifications" {...props} />;
export const ArrowTrendingUpIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="trending_up" {...props} />;
export const ArrowTrendingDownIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="trending_down" {...props} />;
export const ListBulletIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="list" {...props} />;
export const BanknotesIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="account_balance_wallet" {...props} />;
export const SparklesIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="auto_awesome" {...props} />;
export const ReceiptLongIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="receipt_long" {...props} />;

export const ChevronLeftIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="chevron_left" {...props} />;
export const ChevronRightIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="chevron_right" {...props} />;
export const CalendarTodayIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="today" {...props} />;
export const EventIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="event" {...props} />; 
export const FiberManualRecordIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="fiber_manual_record" {...props} />; 
export const EnvelopeIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="mail" {...props} />; 
export const MoreVertIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="more_vert" {...props} />;
export const PhoneIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="call" {...props} />;

export const SmartToyIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="smart_toy" {...props} />;
export const SendIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="send" {...props} />;
export const ContentCopyIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="content_copy" {...props} />;
export const LightbulbIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="lightbulb" {...props} />;
export const MenuIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="menu" {...props} />;
export const MicrophoneIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="mic" {...props} />;
export const AttachFileIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="attach_file" {...props} />;
export const PrintIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="print" {...props} />;
export const CameraIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="photo_camera" {...props} />;
export const ArrowForwardIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="arrow_forward" {...props} />;
export const ArrowUpwardIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="arrow_upward" {...props} />;
export const FinishFlagIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="sports_score" {...props} />;
export const WarningIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="warning" {...props} />;
export const UndoIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="undo" {...props} />;
export const ArrowBackIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="arrow_back" {...props} />;
export const PublicIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="public" {...props} />;
export const ApartmentIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="apartment" {...props} />;
export const RepeatIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="repeat" {...props} />;
export const MapPinIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="map_pin" {...props} />;
export const HandshakeIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="handshake" {...props} />;



// Auth Icons
export const UserIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="person" {...props} />
export const LogoutIcon: React.FC<IconProps> = (props) => <MaterialSymbol iconName="logout" {...props} />