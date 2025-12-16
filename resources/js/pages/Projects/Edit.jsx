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
  Select,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';

const ProjectEdit = ({ dropdowns: { users, companies } }) => {
  const { item } = usePage().props;

  // 1️⃣ Filter team leaders and format for the Select
  const teamLeaders = (users || [])
    .filter(user => user.roles?.some(role => role.name === 'team leader'))
    .map(user => ({ value: user.id.toString(), label: user.name }));

  const [form, submit, updateValue] = useForm(
    'post',
    route('projects.update', item.id),
    {
      _method: 'put',
      name: item.name,
      description: item.description || '',
      client_company_id: item.client_company_id?.toString() || '',
      team_leader_id: item.team_leader_id?.toString() || '',
    }
  );

  return (
    <>
      <Breadcrumbs fz={14} mb={30}>
        <Anchor href="#" onClick={() => redirectTo('projects.index')} fz={14}>
          Projects
        </Anchor>
        <div>Edit</div>
      </Breadcrumbs>

      <Grid justify="space-between" align="flex-end" gutter="xl" mb="lg">
        <Grid.Col span="auto">
          <Title order={1}>Edit project</Title>
        </Grid.Col>
      </Grid>

      <ContainerBox maw={500}>
        <form onSubmit={submit}>
          <TextInput
            label="Name"
            placeholder="Project name"
            required
            mt="md"
            value={form.data.name}
            onChange={e => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <Textarea
            label="Description"
            placeholder="Project description"
            mt="md"
            autosize
            minRows={4}
            maxRows={8}
            value={form.data.description}
            onChange={e => updateValue('description', e.target.value)}
          />

          <Select
            label="Company requesting work"
            placeholder="Select company"
            required
            mt="md"
            value={form.data.client_company_id}
            onChange={value => updateValue('client_company_id', value)}
            data={companies}
            error={form.errors.client_company_id}
          />

          <Select
            label="Team Leader"
            placeholder="Select team leader"
            required
            mt="md"
            value={form.data.team_leader_id}
            onChange={value => updateValue('team_leader_id', value)}
            data={users} // <- directly use users from backend
            error={form.errors.team_leader_id}
          />


          <Group justify="space-between" mt="xl">
            <BackButton route="projects.index" />
            <ActionButton loading={form.processing}>Update</ActionButton>
          </Group>
        </form>
      </ContainerBox>
    </>
  );
}; 

ProjectEdit.layout = page => <Layout title="Edit project">{page}</Layout>;

export default ProjectEdit;
