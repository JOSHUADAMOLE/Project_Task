import { Center, Group, Text, rem, useComputedColorScheme } from "@mantine/core";

export default function Logo(props) {
  const computedColorScheme = useComputedColorScheme();

  return (
    <Group wrap="nowrap" {...props}>
      <Center
        bg={computedColorScheme === "dark" ? "white.8" : "white.9"}
        p={5}
        style={{ borderRadius: "100%" }}
      >
        <img
          src="/assets/logo.png" // ← change this to your actual file path
          alt="Logo"
          style={{
            width: rem(25),
            height: rem(25),
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      </Center>
      <Text fz={20} fw={600}>
        caTask
      </Text>
    </Group>
  );
}