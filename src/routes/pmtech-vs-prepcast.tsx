import { createFileRoute, redirect } from "@tanstack/react-router";

/** Slug heredado de la marca anterior: redirección permanente al nuevo slug. */
export const Route = createFileRoute("/pmtech-vs-prepcast")({
  beforeLoad: () => {
    throw redirect({ to: "/top-pm-simulator-vs-prepcast", statusCode: 301 });
  },
});
