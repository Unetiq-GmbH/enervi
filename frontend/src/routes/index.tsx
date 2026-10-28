import { createBrowserRouter } from "react-router-dom";

import Article from "@/pages/Article";
import Articles from "@/pages/Articles";
import CreateArticle from "@/pages/CreateArticle";
import CreatePin from "@/pages/CreatePin";
import EditArticle from "@/pages/EditArticle";
import EditPin from "@/pages/EditPin";
import GenerateImage from "@/pages/GenerateImage";
import GenerateImageResult from "@/pages/GenerateImageResult";
import Home from "@/pages/Home";
import MapPage from "@/pages/MapPage";
import NotFound from "@/pages/NotFound";
import Pins from "@/pages/Pins";

import Layout from "@ui/Layout";

import UserRole from "../enums/UserRole";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Layout>
          <Home />
        </Layout>
      ),
    },
    {
      path: "/articles",
      element: (
        <Layout>
          <Articles />
        </Layout>
      ),
    },
    {
      path: "/articles/:id",
      element: (
        <Layout>
          <Article />
        </Layout>
      ),
    },
    {
      path: "/edit-article/:id",
      element: (
        <ProtectedRoute
          allowedRoles={[UserRole.ADMIN, UserRole.USER]}
          component={() => (
            <Layout>
              <EditArticle />
            </Layout>
          )}
        />
      ),
    },
    {
      path: "/create-article",
      element: (
        <ProtectedRoute
          allowedRoles={[UserRole.ADMIN, UserRole.USER]}
          component={() => (
            <Layout>
              <CreateArticle />
            </Layout>
          )}
        />
      ),
    },
    {
      path: "/generate-image",
      element: (
        <Layout>
          <GenerateImage />
        </Layout>
      ),
    },
    {
      path: "/generate-image-result/:imageManipulationUUID",
      element: (
        <Layout>
          <GenerateImageResult />
        </Layout>
      ),
    },
    {
      path: "/pins",
      element: (
        <ProtectedRoute
          allowedRoles={[UserRole.ADMIN, UserRole.USER]}
          component={() => (
            <Layout>
              <Pins />
            </Layout>
          )}
        />
      ),
    },
    {
      path: "/edit-pin/:lat/:lng",
      element: (
        <ProtectedRoute
          allowedRoles={[UserRole.ADMIN, UserRole.USER]}
          component={() => (
            <Layout>
              <EditPin />
            </Layout>
          )}
        />
      ),
    },
    {
      path: "/create-pin",
      element: (
        <ProtectedRoute
          allowedRoles={[UserRole.ADMIN, UserRole.USER]}
          component={() => (
            <Layout>
              <CreatePin />
            </Layout>
          )}
        />
      ),
    },
    {
      path: "/map",
      element: <MapPage />,
    },
    {
      path: "*",
      element: (
        <Layout>
          <NotFound />
        </Layout>
      ),
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  }
);

export default router;
