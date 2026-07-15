import {
  Link as RouterLink,
  Outlet,
  useLocation,
  useNavigate as useRouterNavigate,
  useParams,
  type LinkProps as RouterLinkProps,
} from "react-router-dom";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

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
  loader?: (context?: any) => unknown | Promise<unknown>;
};

type PageDataState = {
  data: unknown;
  reload: () => void;
};

const PageDataContext = createContext<PageDataState | null>(null);

export function PageDataProvider({
  page,
  children,
}: {
  page: PageDefinition;
  children: ReactNode;
}) {
  const location = useLocation();
  const params = useParams();
  const [data, setData] = useState<unknown>();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(Boolean(page.loader));
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    if (!page.loader) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    Promise.resolve(page.loader({ params }))
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason : new Error(String(reason)));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [location.key, page, params, revision]);

  const value = useMemo(() => ({ data, reload: () => setRevision((value) => value + 1) }), [data]);

  if (loading) {
    return (
      <div className="grid min-h-[12rem] place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div className="m-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <p className="font-semibold text-destructive">Unable to load this page</p>
        <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        <button className="mt-3 text-sm font-semibold text-primary" onClick={value.reload}>
          Try again
        </button>
      </div>
    );
  }

  return <PageDataContext.Provider value={value}>{children}</PageDataContext.Provider>;
}

export function useLoaderData<T = any>(_options?: unknown) {
  const state = useContext(PageDataContext);
  if (!state) throw new Error("useLoaderData must be used in a page with PageDataProvider");
  return state.data as T;
}

export function useRouter() {
  const state = useContext(PageDataContext);
  const navigate = useRouterNavigate();
  return {
    invalidate: async () => state?.reload(),
    navigate: ({ to, params, replace }: { to: string; params?: RouteParams; replace?: boolean }) =>
      navigate(fillParams(to, params), { replace }),
  };
}

export function definePage(path: string) {
  return <T extends PageDefinition>(definition: T) => ({
    ...definition,
    path,
    useParams,
    useLoaderData,
  });
}

export function redirect({ to }: { to: string }) {
  return new Response(null, { status: 302, headers: { Location: to } });
}

export { Outlet, useParams };
