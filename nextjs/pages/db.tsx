import { PrismaClient } from "@prisma/client";

const DbCall = ({ allUsers }: { allUsers: any[] }) => {
  const makeNew = () => {
    fetch("/test-api/write-new-user")
      .then((res) => res.json())
      .then((res) => console.log(res));
  };

  return (
    <>
      <button onClick={() => makeNew()}>tryMakeNew</button>
      <p>{allUsers}</p>
      <pre>{JSON.stringify(allUsers, null, 2)}</pre>
    </>
  );
};

export default DbCall;

export const getStaticProps = async () => {
  const prisma = new PrismaClient();
  const allUsers = await prisma.user.findMany();
  return {
    props: {
      allUsers,
    },
    revalidate: 5,
  };
};
