import { ReactChildren } from "@/types";

import Footer from "../Footer";
import CookieBanner from "@/components/CookieBanner";

const Layout = ({ children }: ReactChildren) => {
  return (
    <>
      {children}
      <Footer />
      <CookieBanner />
    </>
  );
};

export default Layout;
