import RichTextEditor from "@/components/RichTextEditor";
import useTasksStore from "@/hooks/store/useTasksStore";
import { dateTime, diffForHumans } from "@/utils/datetime";
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Group,
  Loader,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import classes from "./css/Comments.module.css";

export default function Comments({ task }) {
  const { comments, fetchComments, saveComment } = useTasksStore();
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const editorRef = useRef(null);

  // ✅ FIX: fetch only when task ID changes
  useEffect(() => {
    if (!task?.id) return;

    setLoading(true);
    fetchComments(task, () => setLoading(false));
  }, [task?.id]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    await saveComment(task, comment, () => {
      setComment("");
      editorRef.current?.setContent("");
    });
  };

  return (
    <Box mb="xl">
      <Title order={3} mt="xl">
        Discussion
        {!loading && (
          <Text c="dimmed" fw={500} display="inline-block" ml={5}>
            ({comments.length})
          </Text>
        )}
      </Title>

      {/* Comment input */}
      <RichTextEditor
        ref={editorRef}
        mt="md"
        placeholder="Write a comment"
        height={100}
        content={comment}
        onChange={setComment}
      />

      <Flex justify="flex-end">
        <Button
          variant="filled"
          mt="md"
          disabled={!comment.trim()}
          onClick={handleAddComment}
        >
          Add Comment
        </Button>
      </Flex>

      {loading ? (
        <Center mih={100}>
          <Loader />
        </Center>
      ) : (
        <Stack gap={30} mt="md">
          {comments.map((comment) => (
            <div key={comment.id}>
              <Group justify="space-between">
                <Group>
                  <Avatar src={comment.user?.avatar} radius="xl" />
                  <div>
                    <Text size="sm" c="blue" fw={500}>
                      {comment.user?.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {comment.user?.job_title}
                    </Text>
                  </div>
                </Group>

                <Tooltip
                  label={dateTime(comment.created_at)}
                  openDelay={250}
                  withArrow
                >
                  <Text size="xs" c="dimmed">
                    {diffForHumans(comment.created_at)}
                  </Text>
                </Tooltip>
              </Group>

              <Text
                pl={54}
                pt={6}
                size="sm"
                className={classes.comment}
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            </div>
          ))}
        </Stack>
      )}
    </Box>
  );
}
