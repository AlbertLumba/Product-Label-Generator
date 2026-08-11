// // src/components/ui/AAGroupedui.tsx

// // src/components/ui/Alert.tsx

// "use client";

// import React from "react";

// export type AlertVariant = "success" | "warning" | "error" | "info";

// export interface AlertProps {
//   variant?: AlertVariant;
//   title?: string;
//   children: React.ReactNode;
//   icon?: React.ReactNode;
//   onDismiss?: () => void;
//   className?: string;
// }

// const alertVariants: Record<AlertVariant, { wrap: string; title: string; icon: string }> = {
//   success: {
//     wrap:  "bg-[var(--gw-fern-bg)] border-[var(--gw-fern-dim)]",
//     title: "text-[var(--gw-fern-text)]",
//     icon:  "text-[var(--gw-fern-text)]",
//   },
//   warning: {
//     wrap:  "bg-[var(--gw-amber-bg)] border-[var(--gw-amber-dim)]",
//     title: "text-[var(--gw-amber)]",
//     icon:  "text-[var(--gw-amber)]",
//   },
//   error: {
//     wrap:  "bg-[var(--gw-red-bg)] border-[var(--gw-red-dim)]",
//     title: "text-[var(--gw-red)]",
//     icon:  "text-[var(--gw-red)]",
//   },
//   info: {
//     wrap:  "bg-[var(--gw-cyan-bg)] border-[var(--gw-cyan-dim)]",
//     title: "text-[var(--gw-cyan)]",
//     icon:  "text-[var(--gw-cyan)]",
//   },
// };

// export const Alert: React.FC<AlertProps> = ({
//   variant = "info",
//   title,
//   children,
//   icon,
//   onDismiss,
//   className = "",
// }) => {
//   const v = alertVariants[variant];
//   return (
//     <div
//       className={`flex gap-2.5 items-start px-3.5 py-3 border rounded-[4px] ${v.wrap} ${className}`}
//     >
//       {icon && (
//         <span className={`flex-shrink-0 mt-[1px] text-[16px] ${v.icon}`}>{icon}</span>
//       )}
//       <div className="flex-1 min-w-0">
//         {title && (
//           <div className={`font-mono text-[11px] tracking-[0.1em] uppercase mb-0.5 ${v.title}`}>
//             {title}
//           </div>
//         )}
//         <div className="text-[13px] text-[var(--gw-sub)] leading-relaxed">
//           {children}
//         </div>
//       </div>
//       {onDismiss && (
//         <button
//           onClick={onDismiss}
//           className="flex-shrink-0 text-[var(--gw-muted)] hover:text-[var(--gw-text)] transition-colors duration-150 cursor-pointer bg-transparent border-none"
//         >
//           ✕
//         </button>
//       )}
//     </div>
//   );
// };

// // src/components/ui/Badge.tsx

// "use client";

// import React from "react";

// // ─────────────────────────────────────────────
// // BADGE
// // ─────────────────────────────────────────────

// export type BadgeVariant = "green" | "cyan" | "amber" | "red" | "muted" | "outline";

// export interface BadgeProps {
//   variant?: BadgeVariant;
//   dot?: boolean;
//   children: React.ReactNode;
//   className?: string;
// }

// const badgeVariants: Record<BadgeVariant, string> = {
//   green:   "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
//   cyan:    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800",
//   amber:   "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
//   red:     "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
//   muted:   "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
//   outline: "bg-transparent text-gray-600 border-gray-300 dark:text-gray-400 dark:border-gray-600",
// };

// const dotColors: Record<BadgeVariant, string> = {
//   green:   "bg-green-600 dark:bg-green-400",
//   cyan:    "bg-cyan-600 dark:bg-cyan-400",
//   amber:   "bg-amber-600 dark:bg-amber-400",
//   red:     "bg-red-600 dark:bg-red-400",
//   muted:   "bg-gray-400 dark:bg-gray-500",
//   outline: "bg-gray-400 dark:bg-gray-500",
// };

// export const Badge: React.FC<BadgeProps> = ({
//   variant = "muted",
//   dot = true,
//   children,
//   className = "",
// }) => {
//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-[3px] border ${badgeVariants[variant]} ${className}`}
//     >
//       {dot && (
//         <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} />
//       )}
//       {children}
//     </span>
//   );
// };

// // src/components/ui/Button.tsx

// "use client";

// import React, { forwardRef } from "react";

// // ─────────────────────────────────────────────
// // BUTTON
// // ─────────────────────────────────────────────

// export type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "cyan";
// export type ButtonSize = "sm" | "md" | "lg";

// export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: ButtonVariant;
//   size?: ButtonSize;
//   loading?: boolean;
//   icon?: React.ReactNode;
//   iconPosition?: "left" | "right";
// }

// const buttonBase =
//   "inline-flex items-center justify-center gap-1.5 font-mono tracking-wide border transition-all duration-150 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-[4px]";

// const buttonVariants: Record<ButtonVariant, string> = {
//   primary:
//     "bg-[var(--gw-fern)] border-[var(--gw-fern-hi)] text-white hover:bg-[var(--gw-fern-hi)]",
//   outline:
//     "bg-transparent border-[var(--gw-border-hi)] text-[var(--gw-sub)] hover:border-[var(--gw-fern)] hover:text-[var(--gw-fern-text)] hover:bg-[rgba(42,107,74,0.13)]",
//   ghost:
//     "bg-transparent border-transparent text-[var(--gw-sub)] hover:text-[var(--gw-text)] hover:bg-[var(--gw-bg3)]",
//   danger:
//     "bg-transparent border-[var(--gw-red-dim)] text-[var(--gw-red)] hover:bg-[var(--gw-red-bg)]",
//   cyan:
//     "bg-transparent border-[var(--gw-cyan-dim)] text-[var(--gw-cyan)] hover:bg-[var(--gw-cyan-bg)]",
// };

// const buttonSizes: Record<ButtonSize, string> = {
//   sm: "text-[12px] px-3.5 py-1.5",
//   md: "text-[13px] px-5 py-2.5",
//   lg: "text-[14px] px-7 py-3",
// };

// export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
//   (
//     {
//       variant = "primary",
//       size = "md",
//       loading = false,
//       icon,
//       iconPosition = "left",
//       children,
//       className = "",
//       disabled,
//       ...props
//     },
//     ref
//   ) => {
//     return (
//       <button
//         ref={ref}
//         disabled={disabled || loading}
//         className={`${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
//         {...props}
//       >
//         {loading && (
//           <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
//         )}
//         {!loading && icon && iconPosition === "left" && icon}
//         {children}
//         {!loading && icon && iconPosition === "right" && icon}
//       </button>
//     );
//   }
// );
// Button.displayName = "Button";

// // src/components/ui/Card.tsx

// "use client";

// import React from "react";

// export interface CardProps {
//   children: React.ReactNode;
//   className?: string;
//   onClick?: () => void;
// }

// export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
//   return (
//     <div
//       className={`bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl ${className}`}
//       onClick={onClick}
//     >
//       {children}
//     </div>
//   );
// };

// // src/components/ui/CheckBox.tsx

// "use client";

// import React, { forwardRef } from "react";
// import { Check } from "lucide-react";

// // ─────────────────────────────────────────────
// // CHECKBOX
// // ─────────────────────────────────────────────

// export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   description?: string;
// }

// export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
//   ({ label, description, className = "", ...props }, ref) => {
//     return (
//       <label className="flex items-start gap-2 cursor-pointer group">
//         <div className="relative flex-shrink-0 mt-0.5">
//           <input ref={ref} type="checkbox" className="sr-only peer" {...props} />
//           <div className="w-3.5 h-3.5 border border-[var(--gw-border)] rounded-[2px] bg-[var(--gw-bg2)] transition-all duration-150 peer-checked:bg-[var(--gw-fern)] peer-checked:border-[var(--gw-fern-hi)] group-hover:border-[var(--gw-border-hi)]" />
//           <Check
//             size={9}
//             strokeWidth={2.5}
//             className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-150 pointer-events-none"
//           />
//         </div>
//         <div className="flex flex-col gap-0.5">
//           {label && (
//             <span className="font-mono text-[13px] text-[var(--gw-sub)] group-hover:text-[var(--gw-text)] transition-colors duration-150">
//               {label}
//             </span>
//           )}
//           {description && (
//             <span className="font-mono text-[11px] text-[var(--gw-muted)]">{description}</span>
//           )}
//         </div>
//       </label>
//     );
//   }
// );
// Checkbox.displayName = "Checkbox";

// // src/components/ui/CodeBlock.tsx

// "use client";

// import React, { useState } from "react";
// import { Check } from "lucide-react";

// // ─────────────────────────────────────────────
// // CODE BLOCK
// // ─────────────────────────────────────────────

// export interface CodeBlockProps {
//   title?: string;
//   language?: string;
//   children: string;
//   onCopy?: () => void;
// }

// export const CodeBlock: React.FC<CodeBlockProps> = ({
//   title,
//   language = "bash",
//   children,
//   onCopy,
// }) => {
//   const [copied, setCopied] = useState(false);

//   const handleCopy = () => {
//     navigator.clipboard.writeText(children);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//     onCopy?.();
//   };

//   return (
//     <div>
//       {title && (
//         <div className="flex items-center justify-between bg-[var(--gw-bg2)] border border-b-0 border-[var(--gw-border)] rounded-t-[4px] px-3.5 py-2">
//           <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-[var(--gw-muted)]">
//             {title}
//           </span>
//           <button
//             onClick={handleCopy}
//             className="font-mono text-[11px] text-[var(--gw-muted)] hover:text-[var(--gw-fern-text)] transition-colors duration-150 cursor-pointer bg-transparent border-none flex items-center gap-1.5"
//           >
//             {copied ? (
//               <>
//                 <Check size={11} /> Copied
//               </>
//             ) : (
//               "Copy"
//             )}
//           </button>
//         </div>
//       )}
//       <pre
//         className={`bg-[var(--gw-bg)] border border-[var(--gw-border)] ${
//           title ? "rounded-b-[4px]" : "rounded-[4px]"
//         } px-4 py-3.5 font-mono text-[12px] text-[var(--gw-sub)] overflow-x-auto leading-relaxed`}
//       >
//         <code>{children}</code>
//       </pre>
//     </div>
//   );
// };

// // src/components/ui/Divider.tsx

// "use client";

// import React from "react";

// // ─────────────────────────────────────────────
// // DIVIDER
// // ─────────────────────────────────────────────

// export interface DividerProps {
//   label?: string;
//   className?: string;
// }

// export const Divider: React.FC<DividerProps> = ({ label, className = "" }) => (
//   <div className={`flex items-center gap-3 my-2 ${className}`}>
//     <div className="flex-1 h-px bg-[var(--gw-border)]" />
//     {label && (
//       <span className="font-mono text-[11px] tracking-[0.1em] text-[var(--gw-muted)] uppercase">
//         {label}
//       </span>
//     )}
//     <div className="flex-1 h-px bg-[var(--gw-border)]" />
//   </div>
// );

// // src/components/ui/IconButton.tsx

// "use client";

// import React, { forwardRef } from "react";
// import type { ButtonVariant, ButtonSize } from "./Button";

// // ─────────────────────────────────────────────
// // ICON BUTTON
// // ─────────────────────────────────────────────

// export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: ButtonVariant;
//   size?: ButtonSize;
//   "aria-label": string;
// }

// const buttonBase =
//   "inline-flex items-center justify-center gap-1.5 font-mono tracking-wide border transition-all duration-150 active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-[4px]";

// const buttonVariants: Record<ButtonVariant, string> = {
//   primary: "bg-[var(--gw-fern)] border-[var(--gw-fern-hi)] text-white hover:bg-[var(--gw-fern-hi)]",
//   outline:
//     "bg-transparent border-[var(--gw-border-hi)] text-[var(--gw-sub)] hover:border-[var(--gw-fern)] hover:text-[var(--gw-fern-text)] hover:bg-[rgba(42,107,74,0.13)]",
//   ghost:
//     "bg-transparent border-transparent text-[var(--gw-sub)] hover:text-[var(--gw-text)] hover:bg-[var(--gw-bg3)]",
//   danger: "bg-transparent border-[var(--gw-red-dim)] text-[var(--gw-red)] hover:bg-[var(--gw-red-bg)]",
//   cyan: "bg-transparent border-[var(--gw-cyan-dim)] text-[var(--gw-cyan)] hover:bg-[var(--gw-cyan-bg)]",
// };

// const padSizes: Record<ButtonSize, string> = {
//   sm: "p-1.5",
//   md: "p-2",
//   lg: "p-2.5",
// };

// export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
//   ({ variant = "outline", size = "md", className = "", children, ...props }, ref) => {
//     return (
//       <button
//         ref={ref}
//         className={`${buttonBase} ${buttonVariants[variant]} ${padSizes[size]} ${className}`}
//         {...props}
//       >
//         {children}
//       </button>
//     );
//   }
// );
// IconButton.displayName = "IconButton";


// // src/components/ui/Input.tsx

// "use client";

// import React, { forwardRef } from "react";

// // ─────────────────────────────────────────────
// // INPUT
// // ─────────────────────────────────────────────

// export type InputStatus = "default" | "error" | "success" | "key";

// export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   hint?: string;
//   status?: InputStatus;
//   prefix?: string;
//   suffix?: string;
//   prefixNode?: React.ReactNode;
//   suffixNode?: React.ReactNode;
// }

// const inputBase =
//   "w-full font-mono text-[14px] bg-[var(--gw-bg2)] border rounded-[4px] px-3 py-2.5 outline-none transition-all duration-150 placeholder:text-[var(--gw-muted)]";

// const inputStatuses: Record<InputStatus, string> = {
//   default:
//     "border-[var(--gw-border)] text-[var(--gw-text)] focus:border-[var(--gw-fern)] focus:shadow-[0_0_0_2px_rgba(42,107,74,0.13)]",
//   error:
//     "border-[var(--gw-red-dim)] text-[var(--gw-text)] focus:border-[var(--gw-red)] focus:shadow-[0_0_0_2px_rgba(200,75,75,0.12)]",
//   success:
//     "border-[var(--gw-fern-dim)] text-[var(--gw-text)] focus:border-[var(--gw-fern)] focus:shadow-[0_0_0_2px_rgba(42,107,74,0.13)]",
//   key: "border-[var(--gw-fern-dim)] text-[var(--gw-fern-text)] bg-[var(--gw-fern-bg)] focus:border-[var(--gw-fern-hi)] focus:shadow-[0_0_0_2px_rgba(42,107,74,0.13)] tracking-[0.04em]",
// };

// export const Input = forwardRef<HTMLInputElement, InputProps>(
//   (
//     {
//       label,
//       hint,
//       status = "default",
//       prefix,
//       suffix,
//       prefixNode,
//       suffixNode,
//       className = "",
//       ...props
//     },
//     ref
//   ) => {
//     const hasLeft = prefix || prefixNode;
//     const hasRight = suffix || suffixNode;

//     return (
//       <div className="flex flex-col gap-1.5">
//         {label && (
//           <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--gw-sub)]">
//             {label}
//           </label>
//         )}
//         <div className="relative">
//           {hasLeft && (
//             <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-[var(--gw-muted)] pointer-events-none">
//               {prefix || prefixNode}
//             </span>
//           )}
//           <input
//             ref={ref}
//             className={`${inputBase} ${inputStatuses[status]} ${hasLeft ? "pl-[28px]" : ""} ${hasRight ? "pr-[52px]" : ""} ${className}`}
//             {...props}
//           />
//           {hasRight && (
//             <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[12px] text-[var(--gw-muted)] pointer-events-none">
//               {suffix || suffixNode}
//             </span>
//           )}
//         </div>
//         {hint && (
//           <span
//             className={`font-mono text-[11px] ${
//               status === "error" ? "text-[var(--gw-red)]" : "text-[var(--gw-muted)]"
//             }`}
//           >
//             {hint}
//           </span>
//         )}
//       </div>
//     );
//   }
// );
// Input.displayName = "Input";

// // src/components/ui/MethodBadge.tsx

// "use client";

// import React from "react";

// // ─────────────────────────────────────────────
// // HTTP METHOD BADGE
// // ─────────────────────────────────────────────

// export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

// export interface MethodBadgeProps {
//   method: HttpMethod;
// }

// const methodStyles: Record<HttpMethod, string> = {
//   GET:     "bg-[#001F3A] text-[#5BA4F5] border-[#0A3A6A]",
//   POST:    "bg-[var(--gw-fern-bg)] text-[var(--gw-fern-text)] border-[var(--gw-fern-dim)]",
//   PUT:     "bg-[var(--gw-amber-bg)] text-[var(--gw-amber)] border-[var(--gw-amber-dim)]",
//   PATCH:   "bg-[var(--gw-amber-bg)] text-[var(--gw-amber)] border-[var(--gw-amber-dim)]",
//   DELETE:  "bg-[var(--gw-red-bg)] text-[var(--gw-red)] border-[var(--gw-red-dim)]",
//   OPTIONS: "bg-[var(--gw-bg3)] text-[var(--gw-sub)] border-[var(--gw-border)]",
// };

// export const MethodBadge: React.FC<MethodBadgeProps> = ({ method }) => (
//   <span
//     className={`font-mono text-[10px] tracking-[0.1em] px-1.5 py-0.5 rounded-[3px] border ${methodStyles[method]}`}
//   >
//     {method}
//   </span>
// );

// // src/components/ui/Radio.tsx

// "use client";

// import React, { forwardRef } from "react";

// // ─────────────────────────────────────────────
// // RADIO
// // ─────────────────────────────────────────────

// export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   description?: string;
// }

// export const Radio = forwardRef<HTMLInputElement, RadioProps>(
//   ({ label, description, className = "", ...props }, ref) => {
//     return (
//       <label className="flex items-start gap-2 cursor-pointer group">
//         <div className="relative flex-shrink-0 mt-0.5">
//           <input ref={ref} type="radio" className="sr-only peer" {...props} />
//           <div className="w-3.5 h-3.5 border border-[var(--gw-border)] rounded-full bg-[var(--gw-bg2)] transition-all duration-150 peer-checked:bg-[var(--gw-fern)] peer-checked:border-[var(--gw-fern-hi)] peer-checked:shadow-[inset_0_0_0_3px_var(--gw-bg2)] group-hover:border-[var(--gw-border-hi)]" />
//         </div>
//         <div className="flex flex-col gap-0.5">
//           {label && (
//             <span className="font-mono text-[13px] text-[var(--gw-sub)] group-hover:text-[var(--gw-text)] transition-colors duration-150">
//               {label}
//             </span>
//           )}
//           {description && (
//             <span className="font-mono text-[11px] text-[var(--gw-muted)]">{description}</span>
//           )}
//         </div>
//       </label>
//     );
//   }
// );
// Radio.displayName = "Radio";

// // src/components/ui/Select.tsx

// "use client";

// import React, { forwardRef } from "react";
// import { ChevronDown } from "lucide-react";

// // ─────────────────────────────────────────────
// // SELECT
// // ─────────────────────────────────────────────

// export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
//   label?: string;
//   hint?: string;
//   options: { value: string; label: string }[];
// }

// export const Select = forwardRef<HTMLSelectElement, SelectProps>(
//   ({ label, hint, options, className = "", ...props }, ref) => {
//     return (
//       <div className="flex flex-col gap-1.5">
//         {label && (
//           <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--gw-sub)]">
//             {label}
//           </label>
//         )}
//         <div className="relative">
//           <select
//             ref={ref}
//             className={`w-full font-mono text-[13px] text-[var(--gw-text)] bg-[var(--gw-bg2)] border border-[var(--gw-border)] rounded-[4px] px-3 py-2.5 pr-8 outline-none appearance-none cursor-pointer transition-all duration-150 focus:border-[var(--gw-fern)] focus:shadow-[0_0_0_2px_rgba(42,107,74,0.13)] ${className}`}
//             {...props}
//           >
//             {options.map((o) => (
//               <option key={o.value} value={o.value}>
//                 {o.label}
//               </option>
//             ))}
//           </select>
//           <ChevronDown
//             size={14}
//             className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--gw-muted)] pointer-events-none"
//           />
//         </div>
//         {hint && (
//           <span className="font-mono text-[11px] text-[var(--gw-muted)]">{hint}</span>
//         )}
//       </div>
//     );
//   }
// );
// Select.displayName = "Select";

// // src/components/ui/TextArea.tsx

// "use client";

// import React, { forwardRef } from "react";

// // ─────────────────────────────────────────────
// // TEXTAREA
// // ─────────────────────────────────────────────

// export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
//   label?: string;
//   hint?: string;
//   status?: "default" | "error";
// }

// export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
//   ({ label, hint, status = "default", className = "", ...props }, ref) => {
//     return (
//       <div className="flex flex-col gap-1.5">
//         {label && (
//           <label className="font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--gw-sub)]">
//             {label}
//           </label>
//         )}
//         <textarea
//           ref={ref}
//           className={`w-full font-mono text-[14px] text-[var(--gw-text)] bg-[var(--gw-bg2)] border rounded-[4px] px-3 py-2.5 outline-none transition-all duration-150 resize-y min-h-[88px] leading-relaxed placeholder:text-[var(--gw-muted)] ${
//             status === "error"
//               ? "border-[var(--gw-red-dim)] focus:border-[var(--gw-red)] focus:shadow-[0_0_0_2px_rgba(200,75,75,0.12)]"
//               : "border-[var(--gw-border)] focus:border-[var(--gw-fern)] focus:shadow-[0_0_0_2px_rgba(42,107,74,0.13)]"
//           } ${className}`}
//           {...props}
//         />
//         {hint && (
//           <span
//             className={`font-mono text-[11px] ${
//               status === "error" ? "text-[var(--gw-red)]" : "text-[var(--gw-muted)]"
//             }`}
//           >
//             {hint}
//           </span>
//         )}
//       </div>
//     );
//   }
// );
// Textarea.displayName = "Textarea";

// // src/components/ui/Toast.tsx

// "use client";

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   useEffect,
//   useRef,
// } from "react";
// import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

// // ─────────────────────────────────────────────
// // TYPES
// // ─────────────────────────────────────────────

// export type ToastVariant = "success" | "error" | "warning" | "info";

// export interface Toast {
//   id: string;
//   title: string;
//   description?: string;
//   variant: ToastVariant;
//   duration?: number;
// }

// interface ToastContextValue {
//   addToast: (toast: Omit<Toast, "id">) => void;
//   removeToast: (id: string) => void;
//   success: (title: string, description?: string, duration?: number) => void;
//   error: (title: string, description?: string, duration?: number) => void;
//   warning: (title: string, description?: string, duration?: number) => void;
//   info: (title: string, description?: string, duration?: number) => void;
// }

// // ─────────────────────────────────────────────
// // CONSTANTS
// // ─────────────────────────────────────────────

// const MAX_TOASTS = 5;
// const DEFAULT_DURATION = 4500;

// const VARIANTS: Record<
//   ToastVariant,
//   { wrap: string; title: string; progress: string; icon: React.ReactNode }
// > = {
//   success: {
//     wrap:     "bg-[var(--gw-fern-bg)] border-[var(--gw-fern-dim)]",
//     title:    "text-[var(--gw-fern-text)]",
//     progress: "bg-[var(--gw-fern-text)]",
//     icon:     <CheckCircle2 size={14} className="text-[var(--gw-fern-text)]" />,
//   },
//   error: {
//     wrap:     "bg-[var(--gw-red-bg)] border-[var(--gw-red-dim)]",
//     title:    "text-[var(--gw-red)]",
//     progress: "bg-[var(--gw-red)]",
//     icon:     <AlertCircle size={14} className="text-[var(--gw-red)]" />,
//   },
//   warning: {
//     wrap:     "bg-[var(--gw-amber-bg)] border-[var(--gw-amber-dim)]",
//     title:    "text-[var(--gw-amber)]",
//     progress: "bg-[var(--gw-amber)]",
//     icon:     <AlertTriangle size={14} className="text-[var(--gw-amber)]" />,
//   },
//   info: {
//     wrap:     "bg-[var(--gw-cyan-bg)] border-[var(--gw-cyan-dim)]",
//     title:    "text-[var(--gw-cyan)]",
//     progress: "bg-[var(--gw-cyan)]",
//     icon:     <Info size={14} className="text-[var(--gw-cyan)]" />,
//   },
// };

// // ─────────────────────────────────────────────
// // CONTEXT
// // ─────────────────────────────────────────────

// const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// export const useToast = (): ToastContextValue => {
//   const ctx = useContext(ToastContext);
//   if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
//   return ctx;
// };

// // ─────────────────────────────────────────────
// // TOAST ITEM
// // ─────────────────────────────────────────────

// type DismissMode = "swipe" | "collapse";

// interface ToastItemProps {
//   toast: Toast;
//   /** 0 = newest/foreground, higher = older/behind */
//   stackIndex: number;
//   onDismiss: (mode: DismissMode) => void;
// }

// const ToastItem: React.FC<ToastItemProps> = ({ toast, stackIndex, onDismiss }) => {
//   const v = VARIANTS[toast.variant];

//   // ── Lifecycle state ──────────────────────────────
//   const [phase, setPhase] = useState<
//     "entering" | "idle" | "exiting-swipe" | "exiting-collapse"
//   >("entering");

//   // Progress bar (0–1, counts down from 1)
//   const [progress, setProgress] = useState(1);

//   const rafRef      = useRef<number | null>(null);
//   const startRef    = useRef<number | null>(null);
//   const elapsedRef  = useRef(0);
//   const pausedRef   = useRef(false);
//   const duration    = toast.duration ?? DEFAULT_DURATION;

//   // ── Enter animation ──────────────────────────────
//   useEffect(() => {
//     const id = requestAnimationFrame(() => {
//       requestAnimationFrame(() => setPhase("idle"));
//     });
//     return () => cancelAnimationFrame(id);
//   }, []);

//   // ── Progress timer ───────────────────────────────
//   const tick = useCallback(
//     (now: number) => {
//       if (pausedRef.current) {
//         startRef.current = now;
//         rafRef.current = requestAnimationFrame(tick);
//         return;
//       }
//       const elapsed = elapsedRef.current + (now - (startRef.current ?? now));
//       const pct = Math.max(0, 1 - elapsed / duration);
//       setProgress(pct);
//       if (elapsed >= duration) {
//         setPhase("exiting-collapse");
//       } else {
//         startRef.current = now;
//         elapsedRef.current = elapsed;
//         rafRef.current = requestAnimationFrame(tick);
//       }
//     },
//     [duration]
//   );

//   useEffect(() => {
//     if (phase !== "idle" || duration <= 0) return;
//     startRef.current = performance.now();
//     rafRef.current = requestAnimationFrame(tick);
//     return () => {
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//     };
//   }, [phase, duration, tick]);

//   // ── Exit triggers ────────────────────────────────
//   useEffect(() => {
//     if (phase === "exiting-swipe" || phase === "exiting-collapse") {
//       if (rafRef.current) cancelAnimationFrame(rafRef.current);
//       const delay = phase === "exiting-swipe" ? 320 : 280;
//       const t = setTimeout(() => onDismiss(phase === "exiting-swipe" ? "swipe" : "collapse"), delay);
//       return () => clearTimeout(t);
//     }
//   }, [phase, onDismiss]);

//   const handleDismiss = () => setPhase("exiting-swipe");

//   // ── Stack visual state (Top-Right positioning) ──
//   // Index 0 = foreground. Each step back: shift up/down, fade, scale
//   const isExiting   = phase === "exiting-swipe" || phase === "exiting-collapse";
//   const isEntering  = phase === "entering";

//   // For top-right, older toasts shift UP and LEFT slightly
//   const stackScale   = isExiting ? 1 : Math.max(0.88, 1 - stackIndex * 0.03);
//   const stackTranslX = isExiting ? 0 : stackIndex * -4; // Shift left for depth
//   const stackTranslY = isExiting ? 0 : stackIndex * -3; // Shift up for stacking
//   const stackOpacity = isExiting ? 0 : Math.max(0.3, 1 - stackIndex * 0.15);

//   // Entry: slides from right + fades in
//   const enterTranslX = isEntering ? 40 : 0;
//   const enterScale   = isEntering ? 0.96 : stackScale;
//   const enterOpacity = isEntering ? 0 : stackOpacity;

//   // Swipe exit: translates right + fades
//   const exitTranslX  = phase === "exiting-swipe" ? 60 : 0;
//   const exitTranslY  = phase === "exiting-swipe" ? 0 : stackTranslY;

//   const transform = `translateX(${exitTranslX + enterTranslX + stackTranslX}px) translateY(${exitTranslY}px) scale(${enterScale})`;
//   const opacity   = enterOpacity;

//   const maxH      = isEntering ? "0px" : isExiting && phase === "exiting-collapse" ? "0px" : "120px";
//   const mb        = isEntering ? "0px" : isExiting && phase === "exiting-collapse" ? "0px" : "8px";

//   // Transition tuning per phase
//   const transition = isEntering
//     ? "none"
//     : phase === "exiting-swipe"
//     ? "opacity 220ms ease, transform 220ms cubic-bezier(0.4,0,1,1), max-height 260ms ease 120ms, margin-bottom 260ms ease 120ms"
//     : phase === "exiting-collapse"
//     ? "opacity 180ms ease, max-height 240ms cubic-bezier(0.4,0,0.2,1), margin-bottom 240ms ease"
//     : "opacity 280ms cubic-bezier(0.4,0,0.2,1), transform 300ms cubic-bezier(0.4,0,0.2,1), max-height 280ms cubic-bezier(0.4,0,0.2,1), margin-bottom 280ms cubic-bezier(0.4,0,0.2,1)";

//   return (
//     <div
//       role="alert"
//       aria-live="assertive"
//       aria-atomic="true"
//       style={{ 
//         transform, 
//         opacity, 
//         maxHeight: maxH, 
//         marginBottom: mb, 
//         overflow: "hidden", 
//         transition, 
//         willChange: "transform, opacity, max-height" 
//       }}
//       className="w-[320px] relative cursor-pointer"
//       onClick={handleDismiss}
//       onMouseEnter={() => { pausedRef.current = true; }}
//       onMouseLeave={() => { pausedRef.current = false; startRef.current = performance.now(); }}
//     >
//       {/* Card */}
//       <div className={`flex gap-2.5 items-start px-3.5 py-3 border rounded-[4px] ${v.wrap}`}>
//         <span className="flex-shrink-0 mt-[1px]">{v.icon}</span>

//         <div className="flex-1 min-w-0">
//           <p className={`font-mono text-[11px] tracking-[0.1em] uppercase mb-0.5 ${v.title}`}>
//             {toast.title}
//           </p>
//           {toast.description && (
//             <p className="font-mono text-[12px] text-[var(--gw-sub)] leading-relaxed">
//               {toast.description}
//             </p>
//           )}
//         </div>

//         <button
//           className="flex-shrink-0 bg-transparent border-none cursor-pointer text-[var(--gw-muted)] hover:text-[var(--gw-text)] transition-colors duration-150 leading-none"
//           aria-label="Dismiss notification"
//           onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
//         >
//           <X size={12} />
//         </button>

//         {/* Progress bar — shrinks left-to-right */}
//         {duration > 0 && (
//           <div
//             className={`absolute bottom-0 left-0 h-[2px] rounded-bl-[4px] ${v.progress} transition-none`}
//             style={{ width: `${progress * 100}%`, transitionProperty: "none" }}
//             aria-hidden="true"
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────
// // PROVIDER
// // ─────────────────────────────────────────────

// export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [toasts, setToasts] = useState<Toast[]>([]);

//   const removeToast = useCallback((id: string) => {
//     setToasts((prev) => prev.filter((t) => t.id !== id));
//   }, []);

//   const addToast = useCallback((toast: Omit<Toast, "id">) => {
//     const id = Math.random().toString(36).slice(2, 9);
//     setToasts((prev) => {
//       // Trim oldest if at cap before adding new
//       const next = prev.length >= MAX_TOASTS ? prev.slice(0, MAX_TOASTS - 1) : prev;
//       return [{ ...toast, id }, ...next]; // newest first = foreground
//     });
//   }, []);

//   const success = useCallback(
//     (title: string, description?: string, duration = DEFAULT_DURATION) =>
//       addToast({ title, description, variant: "success", duration }),
//     [addToast]
//   );
//   const error = useCallback(
//     (title: string, description?: string, duration = DEFAULT_DURATION) =>
//       addToast({ title, description, variant: "error", duration }),
//     [addToast]
//   );
//   const warning = useCallback(
//     (title: string, description?: string, duration = DEFAULT_DURATION) =>
//       addToast({ title, description, variant: "warning", duration }),
//     [addToast]
//   );
//   const info = useCallback(
//     (title: string, description?: string, duration = DEFAULT_DURATION) =>
//       addToast({ title, description, variant: "info", duration }),
//     [addToast]
//   );

//   return (
//     <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
//       {children}
//       <ToastContainer toasts={toasts} onRemove={removeToast} />
//     </ToastContext.Provider>
//   );
// };

// // ─────────────────────────────────────────────
// // CONTAINER - Top Right Position
// // ─────────────────────────────────────────────

// interface ToastContainerProps {
//   toasts: Toast[];
//   onRemove: (id: string) => void;
// }

// const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => (
//   <div
//     role="region"
//     aria-label="Notifications"
//     aria-live="polite"
//     className="fixed top-5 right-5 z-[200] flex flex-col items-end gap-0"
//     // flex-col with gap-0 - newer toasts appear at the top
//   >
//     {toasts.map((toast, i) => (
//       <ToastItem
//         key={toast.id}
//         toast={toast}
//         stackIndex={i}
//         onDismiss={() => onRemove(toast.id)}
//       />
//     ))}
//   </div>
// );

// // src/components/ui/Toggle.tsx

// "use client";

// import React from "react";

// // ─────────────────────────────────────────────
// // TOGGLE
// // ─────────────────────────────────────────────

// export interface ToggleProps {
//   checked?: boolean;
//   onChange?: (checked: boolean) => void;
//   label?: string;
//   description?: string;
//   disabled?: boolean;
// }

// export const Toggle: React.FC<ToggleProps> = ({
//   checked = false,
//   onChange,
//   label,
//   description,
//   disabled = false,
// }) => {
//   return (
//     <div
//       className={`flex items-center gap-2.5 ${
//         disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
//       }`}
//       onClick={() => !disabled && onChange?.(!checked)}
//       role="switch"
//       aria-checked={checked}
//       tabIndex={0}
//       onKeyDown={(e) => e.key === " " && !disabled && onChange?.(!checked)}
//     >
//       <div
//         className={`relative w-9 h-5 rounded-[10px] border transition-all duration-200 flex-shrink-0 ${
//           checked 
//             ? "bg-[var(--gw-fern)] border-[var(--gw-fern-hi)]" 
//             : "bg-[var(--gw-bg3)] border-[var(--gw-border)]"
//         }`}
//       >
//         <div
//           className={`absolute top-[3px] w-3.5 h-3.5 rounded-full transition-transform duration-200 shadow-sm ${
//             checked 
//               ? "translate-x-[18px] bg-white" 
//               : "translate-x-[2px] bg-[var(--gw-sub)]"
//           }`}
//         />
//       </div>
//       {(label || description) && (
//         <div className="flex flex-col gap-0.5">
//           {label && (
//             <span className="font-mono text-[13px] text-[var(--gw-text)]">{label}</span>
//           )}
//           {description && (
//             <span className="font-mono text-[11px] text-[var(--gw-muted)]">{description}</span>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };