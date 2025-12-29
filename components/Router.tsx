import React from "react";

export type Routes = "/" | "/profile" | "/settings";

type RouteContextType = {
	route: Routes;
	setRoute: (route: Routes) => void;
};

export const RouteContext = React.createContext<RouteContextType>(
	{} as RouteContextType,
);

export const useRoute = () => {
	const context = React.useContext(RouteContext);
	if (!context) {
		throw new Error("useRoute must be used within a RouterProvider");
	}
	return context;
};

export const RouterProvider = ({ children }: { children: React.ReactNode }) => {
	const [route, setRoute] = React.useState<Routes>("/");

	return (
		<RouteContext.Provider value={{ route, setRoute }}>
			{children}
		</RouteContext.Provider>
	);
};
