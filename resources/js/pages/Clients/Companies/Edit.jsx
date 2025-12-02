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
  Grid,
  Group,
  TextInput,
  Select,
  Title,
  Fieldset,
} from '@mantine/core';

const ClientCompanyEdit = () => {
  const { item, dropdowns: { countries } } = usePage().props;

  const [form, submit, updateValue] = useForm('post', route('clients.companies.update', item.id), {
    _method: 'put',
    name: item.name,
    address: item.address || '',
    postal_code: item.postal_code || '',
    city: item.city || '',
    country_id: item.country_id || '',
    email: item.email || '',
    phone: item.phone || '',
    web: item.web || '',
  });

  return (
    <>
      <Breadcrumbs fz={14} mb={30}>
        <Anchor href="#" onClick={() => redirectTo('clients.companies.index')} fz={14}>
          Companies
        </Anchor>
        <div>Edit</div>
      </Breadcrumbs>

      <Grid justify='space-between' align='flex-end' gutter='xl' mb='lg'>
        <Grid.Col span='auto'>
          <Title order={1}>Edit company</Title>
        </Grid.Col>
      </Grid>

      <ContainerBox maw={600}>
        <form onSubmit={submit}>
          <TextInput
            label='Name'
            placeholder='Company name'
            required
            value={form.data.name}
            onChange={e => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <Fieldset legend='Location' mt='xl'>
            <TextInput
              label='Address'
              placeholder='Address'
              value={form.data.address}
              onChange={e => updateValue('address', e.target.value)}
              error={form.errors.address}
            />

            <Group grow>
              <TextInput
                label='Postal code'
                placeholder='Postal code'
                mt='md'
                value={form.data.postal_code}
                onChange={e => updateValue('postal_code', e.target.value)}
                error={form.errors.postal_code}
              />

              <TextInput
                label='City'
                placeholder='City'
                mt='md'
                value={form.data.city}
                onChange={e => updateValue('city', e.target.value)}
                error={form.errors.city}
              />
            </Group>

            <TextInput
              label='Country'
              placeholder='Country'
              mt='md'
              value={form.data.country_id}
              onChange={e => updateValue('country_id', e.target.value)}
              error={form.errors.country_id}
            />
          </Fieldset>

          <Fieldset legend='Contact' mt='xl'>
            <Group grow>
              <TextInput
                label='Email'
                placeholder='Email'
                value={form.data.email}
                onChange={e => updateValue('email', e.target.value)}
                error={form.errors.email}
              />

              <TextInput
                label='Phone'
                placeholder='Phone'
                value={form.data.phone}
                onChange={e => updateValue('phone', e.target.value)}
                error={form.errors.phone}
              />
            </Group>

            <TextInput
              label='Web'
              placeholder='Web'
              mt='md'
              value={form.data.web}
              onChange={e => updateValue('web', e.target.value)}
              error={form.errors.web}
            />
          </Fieldset>

          <Group justify='space-between' mt='xl'>
            <BackButton route='clients.companies.index' />
            <ActionButton loading={form.processing}>Update</ActionButton>
          </Group>
        </form>
      </ContainerBox>
    </>
  );
};

ClientCompanyEdit.layout = page => <Layout title='Edit company'>{page}</Layout>;

export default ClientCompanyEdit;
