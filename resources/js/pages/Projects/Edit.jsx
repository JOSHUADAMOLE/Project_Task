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
  MultiSelect,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';

const ProjectEdit = ({ dropdowns: { users } }) => {
  const { item } = usePage().props;

  const [form, submit, updateValue] = useForm('post', route('projects.update', item.id), {
    _method: 'put',
    name: item.name,
    description: item.description || '',
    users: item.users.map(i => i.id.toString()),
  });

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
        <Grid.Col span="content"></Grid.Col>
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

          <MultiSelect
            label="Grant access to users"
            placeholder="Select users"
            mt="md"
            searchable
            value={form.data.users}
            onChange={values => updateValue('users', values)}
            data={users}
            error={form.errors.users}
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
