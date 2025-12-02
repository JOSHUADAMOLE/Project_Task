import ActionButton from '@/components/ActionButton';
import BackButton from '@/components/BackButton';
import useForm from '@/hooks/useForm';
import ContainerBox from '@/layouts/ContainerBox';
import Layout from '@/layouts/MainLayout';
import { redirectTo } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import {
  Anchor,
  Breadcrumbs,
  Select,
  Fieldset,
  Grid,
  Group,
  TextInput,
  Title,
} from '@mantine/core';

const ClientCompanyCreate = () => {
  const {
    dropdowns: { countries },
  } = usePage().props;

  const [form, submit, updateValue] = useForm(
    'post',
    route('clients.companies.store'),
    {
      name: '',
      client_name: '',
      address: '',
      postal_code: '',
      city: '',
      country_id: '',
      email: '',
      phone: '',
      web: '',
    }
  );

  return (
    <>
      <Breadcrumbs fz={14} mb={30}>
        <Anchor
          href="#"
          onClick={() => redirectTo('clients.companies.index')}
          fz={14}
        >
          Companies
        </Anchor>
        <div>Create</div>
      </Breadcrumbs>

      <Grid justify="space-between" align="flex-end" gutter="xl" mb="lg">
        <Grid.Col span="auto">
          <Title order={1}>Create company</Title>
        </Grid.Col>
      </Grid>

      <ContainerBox maw={600}>
        <form onSubmit={submit}>
          {/* Company Name */}
          <TextInput
            label="Company Name"
            placeholder="Company name"
            required
            value={form.data.name}
            onChange={(e) => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          {/* Location */}
          <Fieldset legend="Location" mt="xl">
            <TextInput
              label="Address"
              placeholder="Address"
              value={form.data.address}
              onChange={(e) => updateValue('address', e.target.value)}
              error={form.errors.address}
            />

            <Group grow>
              <TextInput
                label="Postal code"
                placeholder="Postal code"
                mt="md"
                value={form.data.postal_code}
                onChange={(e) => updateValue('postal_code', e.target.value)}
                error={form.errors.postal_code}
              />

              <TextInput
                label="City"
                placeholder="City"
                mt="md"
                value={form.data.city}
                onChange={(e) => updateValue('city', e.target.value)}
                error={form.errors.city}
              />
            </Group>

            <Select
              label="Country"
              placeholder="Select country"
              mt="md"
              searchable={true}
              value={form.data.country_id}
              onChange={(value) => updateValue('country_id', value)}
              data={countries}
              error={form.errors.country_id}
            />
          </Fieldset>

          {/* Contact */}
          <Fieldset legend="Contact" mt="xl">
            <Group grow>
              <TextInput
                label="Email"
                placeholder="Email"
                value={form.data.email}
                onChange={(e) => updateValue('email', e.target.value)}
                error={form.errors.email}
              />

              <TextInput
                label="Phone"
                placeholder="Phone"
                value={form.data.phone}
                onChange={(e) => updateValue('phone', e.target.value)}
                error={form.errors.phone}
              />
            </Group>

            <TextInput
              label="Web"
              placeholder="Web"
              mt="md"
              value={form.data.web}
              onChange={(e) => updateValue('web', e.target.value)}
              error={form.errors.web}
            />
          </Fieldset>

          {/* Buttons */}
          <Group justify="space-between" mt="xl">
            <BackButton route="clients.companies.index" />
            <ActionButton loading={form.processing}>Create</ActionButton>
          </Group>
        </form>
      </ContainerBox>
    </>
  );
};

ClientCompanyCreate.layout = (page) => (
  <Layout title="Create company">{page}</Layout>
);

export default ClientCompanyCreate;
