import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate as useRouterNavigate,
  useParams,
  type LinkProps as RouterLinkProps,
} from "react-router-dom";

type RouteParams = Record<string, string | number>;

type AppLinkProps = Omit<RouterLinkProps, "to"> & {
  to: RouterLinkProps["to"] | string;
  params?: RouteParams;
};

function fillParams(to: AppLinkProps["to"], params?: RouteParams) {
  if (typeof to !== "string" || !params) return to;
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`$${key}`, encodeURIComponent(String(value))),
    to,
  );
}

export function Link({ to, params, ...props }: AppLinkProps) {
  return <RouterLink to={fillParams(to, params)} {...props} />;
}

export function useNavigate() {
  const navigate = useRouterNavigate();

  return ({ to, params, replace }: { to: string; params?: RouteParams; replace?: boolean }) =>
    navigate(fillParams(to, params), { replace });
}

export function useRouterState<T>({
  select,
}: {
  select: (state: { location: ReturnType<typeof useLocation> }) => T;
}) {
  const location = useLocation();
  return select({ location });
}

type PageDefinition = {
  component?: React.ComponentType;
  head?: (context: any) => unknown;
  beforeLoad?: (context: any) => unknown;
};

export function definePage(path: string) {
  return <T extends PageDefinition>(definition: T) => ({
    ...definition,
    path,
    useParams,
  });
}

export function redirect({ to }: { to: string }) {
  return new Response(null, { status: 302, headers: { Location: to } });
}

export { Outlet, useParams };
