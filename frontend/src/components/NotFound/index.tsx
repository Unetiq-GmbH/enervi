import Header from "@ui/Header";
import Typography from "@ui/Typography";
import Wrapper from "@ui/Wrapper";

interface Props {
  message: string;
}

const NotFound = ({ message }: Props) => {
  return (
    <Wrapper>
      <Header showUpload />
      <Typography
        as={"h3"}
        fontWeight={600}
        mb="8px"
        textAlign={"center"}
        sx={{ margin: "80px" }}
      >
        {message}
      </Typography>
    </Wrapper>
  );
};

export default NotFound;
