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
  IconUsers,
  IconListDetails,
} from "@tabler/icons-react";
import { useEffect } from "react";
import NavbarLinksGroup from "./NavbarLinksGroup";
import UserButton from "./UserButton";
import classes from "./css/NavBarNested.module.css";

export default function Sidebar() {
  const { version } = usePage().props;
  const { items, setItems } = useNavigationStore();

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
        visible: can("view projects"),
      },
      {
        label: "Assign Work",
        icon: IconLayoutList,
        active: route().current("my-work.*"),
        opened: route().current("my-work.*"),
        visible: can("view tasks") || can("view activities"),
        links: [
          {
            label: "Tasks",
            link: route("my-work.tasks.index"),
            active: route().current("my-work.tasks.*"),
            visible: can("view tasks"),
          },
          {
            label: "Activity",
            link: route("my-work.activity.index"),
            active: route().current("my-work.activity.*"),
            visible: can("view activities"),
          },
        ],
      },
      {
        label: "Clients",
        icon: IconBuildingSkyscraper,
        active: route().current("clients.*"),
        opened: route().current("clients.*"),
        visible: can("view client users") || can("view client companies"),
        links: [
          {
            label: "Users",
            link: route("clients.users.index"),
            active: route().current("clients.users.*"),
            visible: can("view client users"),
          },
          {
            label: "Companies",
            link: route("clients.companies.index"),
            active: route().current("clients.companies.*"),
            visible: can("view client companies"),
          },
        ],
      }, 
      {
        label: "Teams",
        icon: IconUsers,
        link: route("teams.index"),
        active: route().current("teams.*"),
        visible: can("view users"),
      },
      {
        label: "All Members",
        icon: IconUsers,
        link: route("users.index"),
        active: route().current("users .*"),
        visible: can("view users"),
      },
      {
        label: "Reports",
        icon: IconReportAnalytics,
        active: route().current("reports.*"),
        opened: route().current("reports.*"),
        visible:true,

        links: [
          {
            label: "Statistics",
            link: route("reports.work-statistics"),
            active: route().current("reports.work-statistics"),
            visible:true,
          }
        ],
      },
      {
        label: "Settings",
        icon: IconSettings,
        active: route().current("settings.*"),
        opened: route().current("settings.*"),
        visible:
          can("view roles") || can("view labels"),
        links: [
          {
            label: "Roles",
            link: route("settings.roles.index"),
            active: route().current("settings.roles.*"),
            visible: can("view roles"),
          },
          {
            label: "Labels",
            link: route("settings.labels.index"),
            active: route().current("settings.labels.*"),
            visible: can("view labels"),
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
