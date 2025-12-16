import Logo from "@/components/Logo";
import useNavigationStore from "@/hooks/store/useNavigationStore";
import { usePage } from "@inertiajs/react";
import { Group, ScrollArea, Text, rem } from "@mantine/core";
import {
  IconGauge,
  IconLayoutList,
  IconReportAnalytics,
  IconBuildingSkyscraper,
  IconSettings,
  IconUsersGroup,
  IconUsers,
  IconListDetails,
} from "@tabler/icons-react";
import { useEffect } from "react";
import NavbarLinksGroup from "./NavbarLinksGroup";
import UserButton from "./UserButton";
import classes from "./css/NavBarNested.module.css";

export default function Sidebar() {
  const { version, auth } = usePage().props;
  const { items, setItems } = useNavigationStore();

  // ROLE CHECKS
  const isClient = auth.user.roles?.includes("client");
  const isTeamLeader = auth.user.roles?.includes("Team Leader");

  useEffect(() => {
    setItems([
      {
        label: "Dashboard",
        icon: IconGauge,
        link: route("dashboard"),
        active: route().current("dashboard"),
        visible: true,
      },

      {
        label: "Projects",
        icon: IconListDetails,
        link: route("projects.index"),
        active: route().current("projects.*"),

        // Team Leader can only see THEIR projects (handled backend)
        visible: can("view projects") || isTeamLeader,
      },

      {
        label: "Assign Work",
        icon: IconLayoutList,
        active: route().current("my-work.*"),
        opened: route().current("my-work.*"),

        // ❌ Team Leader & Client MUST NOT see it
        visible: !isClient && true && (can("view tasks") || can("view activities")),

        links: [
          {
            label: "Tasks",
            link: route("my-work.tasks.index"),
            active: route().current("my-work.tasks.*"),
            visible: !isClient && !isTeamLeader && can("view tasks"),
          },
          {
            label: "Activity",
            link: route("my-work.activity.index"),
            active: route().current("my-work.activity.*"),
            visible: !isClient && true && can("view activities"),
          },
        ],
      },

      {
        label: "Companies",
        icon: IconBuildingSkyscraper,
        link: route("clients.companies.index"),
        active: route().current("clients.companies.*"),

        // ❌ Team Leader cannot view companies
        visible: !isTeamLeader && can("view client companies"),
      },

      {
        label: "Teams",
        icon: IconUsersGroup,
        link: route("teams.index"),
        active: route().current("teams.*"),

        // Admins and Team Leaders both need this
        visible: can("view users") || isTeamLeader,
      },

      {
        label: "All Users",
        icon: IconUsers,
        active: route().current("users.*"),
        opened: route().current("users.*"),

        // ❌ Hide from Team Leader
        visible: !isTeamLeader && (can("view users") || can("view client users")),

        links: [
          {
            label: "Client Users",
            link: route("clients.users.index"),
            active: route().current("clients.users.*"),
            visible: !isTeamLeader && can("view client users"),
          },
          {
            label: "Member Users",
            link: route("users.index"),
            active: route().current("users.*"),
            visible: !isTeamLeader && can("view users"),
          },
        ],
      },

      {
        label: "Reports",
        icon: IconReportAnalytics,
        active: route().current("reports.*"),
        opened: route().current("reports.*"),

        // ❌ Only Admins & Super Admin
        visible: true,
        links: [
          {
            label: "Statistics",
            link: route("reports.work-statistics"),
            active: route().current("reports.work-statistics"),
            visible: true,
          },
        ],
      },

      {
        label: "Settings",
        icon: IconSettings,
        active: route().current("settings.*"),
        opened: route().current("settings.*"),

        // ❌ Team Leader cannot open settings
        visible: !isTeamLeader && (can("view roles") || can("view labels")),

        links: [
          {
            label: "Roles",
            link: route("settings.roles.index"),
            active: route().current("settings.roles.*"),
            visible: !isTeamLeader && can("view roles"),
          },
          {
            label: "Labels",
            link: route("settings.labels.index"),
            active: route().current("settings.labels.*"),
            visible: !isTeamLeader && can("view labels"),
          },
        ],
      },
    ]);
  }, []);

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Logo style={{ width: rem(120) }} />
          <Text size="xs" className={classes.version}>
            v{version}
          </Text>
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>
          {items
            .filter((i) => i.visible)
            .map((item) => (
              <NavbarLinksGroup key={item.label} item={item} />
            ))}
        </div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserButton />
      </div>
    </nav>
  );
}
