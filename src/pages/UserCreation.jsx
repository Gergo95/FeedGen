import GroupCreator from "../components/Groups/GroupCreator";
import Navbar from "../components/Navbar";
import PageCreator from "../components/Pages/PageCreator";
import EventCreator from "../components/Events/EventCreator";
const GroupsPage = () => {
  return (
    <div>
      <Navbar />
      <GroupCreator />
      <PageCreator />
      <EventCreator />
    </div>
  );
};

export default GroupsPage;
