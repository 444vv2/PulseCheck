import { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "outline" | "text" | "delete";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  const classes = [styles[variant], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} {...props} />;
}
