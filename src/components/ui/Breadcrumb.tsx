import { Link as RouterLink, useLocation } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import React from "react";

interface Crumb {
  label: string;
  to?: string;    
}

interface BreadcrumbProps {
  crumbs?: Crumb[];
  rootLabel?: string;  
  rootTo?: string;     
}

const titleCase = (s: string) =>
  s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  crumbs,
  rootLabel = "Home",
  rootTo = "/",
}) => {
  const { pathname } = useLocation();

  const autoCrumbs: Crumb[] = React.useMemo(() => {
    if (crumbs) return crumbs;

    const segments = pathname.split("/").filter(Boolean);
    return [
      { label: rootLabel, to: rootTo },
      ...segments.map((seg, idx) => ({
        label: titleCase(seg),
        to:
          idx === segments.length - 1
            ? undefined
            : "/" + segments.slice(0, idx + 1).join("/"),
      })),
    ];
  }, [pathname, crumbs, rootLabel, rootTo]);

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      className="text-sm"
    >
      {autoCrumbs.map(({ label, to }, i) =>
        to ? (
          <Link
            key={i}
            component={RouterLink}
            underline="hover"
            color="inherit"
            to={to}
            className="hover:text-primary transition-colors"
          >
            {label}
          </Link>
        ) : (
          <Typography
            key={i}
            color="text.primary"
            sx={{fontWeight:"600"}}
            className="font-medium text-red-800 dark:text-gray-100"
          >
            {label}
          </Typography>
        )
      )}
    </Breadcrumbs>
  );
};

export default Breadcrumb;
