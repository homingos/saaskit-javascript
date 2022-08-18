type SizeFontType =
  | "caption"
  | "h6"
  | "h5"
  | "h4"
  | "h3"
  | "h2"
  | "h1"
  | "large"
  | "extra-large";

type ColorType = "primary" | "secondary" | "tertiary";

const SizeTypes: Record<SizeFontType, string> = {
  caption: "10px",
  h6: "12px",
  h5: "14px",
  h4: "16px",
  h3: "18px",
  h2: "20px",
  h1: "24px",
  large: "32px",
  "extra-large": "36px",
};

const FontWeightTypes = {
  normal: "normal",
  bold: "bold",
  bolder: "bolder",
};

const Colors: Record<ColorType, string> = {
  primary: "#111827",
  secondary: "#6B7280",
  tertiary: "#1D4ED8",
};

interface TextProps {
  className?: string;
  children: React.ReactNode;
  color?: keyof typeof Colors;
  size?: keyof typeof SizeTypes;
  fontWeight?: keyof typeof FontWeightTypes;
}

const Text: React.FC<TextProps> = ({
  children,
  size = "h4",
  fontWeight = "normal",
  className,
  color = "primary",
  ...props
}) => {
  return (
    <div
      style={{ fontSize: SizeTypes[size], color: Colors[color] }}
      className={`${FontWeightTypes[fontWeight]}  ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Text;
