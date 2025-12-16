import useForm from "@/hooks/useForm";
import { hasRoles } from "@/utils/user";
import { Button, Flex, MultiSelect, Skeleton, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import axios from "axios";
import { useEffect, useState } from "react";

function ModalForm({ item }) {
  const [loading, setLoading] = useState(true);
  const [usersDropdown, setUsersDropdown] = useState([]);
  const [clientsDropdown, setClientsDropdown] = useState([]);

  // Initialize form with existing user access
  const [form, submit, updateValue] = useForm(
    "post",
    route("projects.user_access", item?.id),
    {
      users: item?.users_with_access
        ?.filter((user) => hasRoles(user, ["team leader"]))
        .map((u) => u.id.toString()) || [],
      clients: item?.users_with_access
        ?.filter((user) => hasRoles(user, ["client"]) && user.reason !== "company owner")
        .map((u) => u.id.toString()) || [],
    }
  );

  const submitModal = (event) => {
    submit(event, {
      onSuccess: () => modals.closeAll(),
      preserveScroll: true,
    });
  };

  useEffect(() => {
    if (!item?.id) return;

    setLoading(true);

    axios
      .get(route("dropdown.values")) // Make sure this route returns { users: [...], clients: [...] }
      .then(({ data }) => {
        // Only team leaders for the users dropdown
        const teamLeaders = (data.users || [])
          .filter((user) => hasRoles(user, ["team leader"]))
          .map((u) => ({ value: u.id.toString(), label: u.name }));

        // Only clients for the company selected in the project
        const companyClients = (data.clients || [])
          .filter((c) => c.client_company_id === item.client_company_id)
          .map((c) => ({ value: c.id.toString(), label: c.name }));

        setUsersDropdown(teamLeaders);
        setClientsDropdown(companyClients);
      })
      .catch(() => alert("Something went wrong, failed to load dropdown values"))
      .finally(() => setLoading(false));
  }, [item]);

  return (
    <form onSubmit={submitModal}>
      {loading ? (
        <>
          <Skeleton height={10} width={50} mt={8} radius="xl" />
          <Skeleton height={25} mt={10} radius="xl" />

          <Skeleton height={10} width={50} mt={25} radius="xl" />
          <Skeleton height={25} mt={10} radius="xl" />
        </>
      ) : (
        <>
          <MultiSelect
            label="Team Leaders"
            placeholder="Select team leaders"
            searchable
            value={form.data.users}
            onChange={(values) => updateValue("users", values)}
            data={usersDropdown}
            error={form.errors.users}
          />

          <MultiSelect
            label="Clients"
            placeholder="Select clients"
            searchable
            mt="md"
            value={form.data.clients}
            onChange={(values) => updateValue("clients", values)}
            data={clientsDropdown}
            error={form.errors.clients}
          />
        </>
      )}

      <Flex justify="flex-end" mt="xl">
        <Button type="submit" w={100} disabled={loading} loading={form.processing}>
          Save
        </Button>
      </Flex>
    </form>
  );
}

const UserAccessModal = (item) => {
  modals.open({
    title: <Text size="xl" fw={700} mb={-10}>User Access</Text>,
    centered: true,
    padding: "xl",
    overlayProps: { backgroundOpacity: 0.55, blur: 3 },
    children: <ModalForm item={item} />,
  });
};

export default UserAccessModal;
