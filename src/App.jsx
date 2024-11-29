import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import FeedPage from "./pages/FeedPage";
import Pages from "./pages/Pages";
import SearchResultsPage from "./pages/SearchResultsPage";
import NotificationsPage from "./pages/NotificationPage";
import Groups from "./pages/Groups";
import Events from "./pages/Events";
import { AuthProvider } from "./context/AuthContext";
import PostProvider from "./context/PostContext";
import UserCreation from "./pages/UserCreation";
import { GroupProvider } from "./context/GroupContext";
import { CommentProvider } from "./context/CommentContext";
import { FriendRequestProvider } from "./context/FriendRequestContext";
import PageProvider from "./context/PagesContext";
import { EventProvider } from "./context/EventsContext";
import { ChatProvider } from "./context/ChatContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import UserProfileEditor from "./components/UserProfile/UserProfileEditor";
import UserProfileProvider from "./context/UserProfileContext";
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PostProvider>
          <GroupProvider>
            <CommentProvider>
              <FriendRequestProvider>
                <PageProvider>
                  <EventProvider>
                    <ChatProvider>
                      <UserProfileProvider>
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<SignUp />} />
                          <Route path="/home" element={<Home />} />

                          {/* Protected Routes */}
                          <Route
                            path="/feed"
                            element={
                              <ProtectedRoute>
                                <FeedPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/group-profile/:groupId"
                            element={
                              <ProtectedRoute>
                                <Groups />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/edit-user-profile/:uid"
                            element={
                              <ProtectedRoute>
                                <UserProfileEditor />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/user/:uid"
                            element={
                              <ProtectedRoute>
                                <UserProfile />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/pages/:pageId"
                            element={
                              <ProtectedRoute>
                                <Pages />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/search-results"
                            element={
                              <ProtectedRoute>
                                <SearchResultsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/notifications"
                            element={
                              <ProtectedRoute>
                                <NotificationsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/events/:eventId"
                            element={
                              <ProtectedRoute>
                                <Events />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/create-new"
                            element={
                              <ProtectedRoute>
                                <UserCreation />
                              </ProtectedRoute>
                            }
                          />

                          <Route path="*" element={<Home />} />
                        </Routes>
                        <ToastContainer />
                      </UserProfileProvider>
                    </ChatProvider>
                  </EventProvider>
                </PageProvider>
              </FriendRequestProvider>
            </CommentProvider>
          </GroupProvider>
        </PostProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
