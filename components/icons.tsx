import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const HandsIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </Base>
);

export const FamilyIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8" cy="7" r="3" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M2.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M13.5 20a3.5 3.5 0 0 1 7 0" />
  </Base>
);

export const CommunityIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 21h18" />
    <path d="M5 21V10l7-5 7 5v11" />
    <path d="M10 21v-5h4v5" />
  </Base>
);

export const PartnershipIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="9" cy="12" r="5" />
    <circle cx="15" cy="12" r="5" />
  </Base>
);

export const RepeatIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M17 2l3 3-3 3" />
    <path d="M4 11V9a4 4 0 0 1 4-4h12" />
    <path d="M7 22l-3-3 3-3" />
    <path d="M20 13v2a4 4 0 0 1-4 4H4" />
  </Base>
);

export const GrantIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h4" />
  </Base>
);

export const CampaignIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 11v2a1 1 0 0 0 1 1h3l5 4V6L7 10H4a1 1 0 0 0-1 1z" />
    <path d="M16 9a4 4 0 0 1 0 6" />
    <path d="M19 6.5a8 8 0 0 1 0 11" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Base>
);

export const PinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </Base>
);

export const GlobeIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z" />
  </Base>
);

export const MailIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Base>
);

export const FoodIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 10h14l-1.2 8.4a2 2 0 0 1-2 1.6H8.2a2 2 0 0 1-2-1.6z" />
    <path d="M8 10l3-6" />
    <path d="M16 10l-3-6" />
    <path d="M10 14v2M14 14v2" />
  </Base>
);

export const TransportIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 16V11l2-5h10l2 5v5" />
    <path d="M3 16h18v2a1 1 0 0 1-1 1h-1M5 19H4a1 1 0 0 1-1-1" />
    <path d="M5 11h14" />
    <circle cx="7.5" cy="19" r="1.5" />
    <circle cx="16.5" cy="19" r="1.5" />
  </Base>
);

export const LodgingIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 19V6" />
    <path d="M3 15h18v4" />
    <path d="M21 15v-3a3 3 0 0 0-3-3h-7v6" />
    <circle cx="7" cy="11" r="2" />
  </Base>
);

export const ExternalIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Base>
);

export const ClockIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);
