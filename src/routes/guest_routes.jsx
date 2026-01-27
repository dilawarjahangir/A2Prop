import About from "../pages/guest/About/About.jsx";
import GuestLayout from "../Layout/GuestLayout.jsx";
import Home from "../pages/guest/Home/Home.jsx";
import BlogDetail from "../pages/guest/Blog/BlogDetail.jsx";
import BlogListings from "../pages/guest/Blog/BlogListings.jsx";
import PropertyDetail from "../pages/guest/Property/PropertyDetail.jsx";
import PropertyListings from "../pages/guest/Property/PropertyListings.jsx";

const withGuestLayout = (Component) => () => (
  <GuestLayout>
    <Component />
  </GuestLayout>
);

const guest_routes = {
  "/": withGuestLayout(Home),
  "/home": withGuestLayout(Home),
  about: withGuestLayout(About),
  "/blog": withGuestLayout(BlogListings),
  "/blog/:slug": withGuestLayout(BlogDetail),
  "/properties": withGuestLayout(PropertyListings),
  "/properties/:slug": withGuestLayout(PropertyDetail),
  "/property/:slug": withGuestLayout(PropertyDetail),
};

export default guest_routes;
