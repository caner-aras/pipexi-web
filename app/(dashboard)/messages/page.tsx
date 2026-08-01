import { MessagesPageContent } from "@/components/messages/messages-page-content";
import { NoOrganizationEmptyState } from "@/components/layout/no-organization-empty-state";
import { BackendApiError } from "@/lib/server/api-client";
import { getSelectedOrganization } from "@/lib/server/selected-organization";
import { getCurrentUser } from "@/lib/server/services/auth.service";
import {
  getConversationUnreadCount,
  listConversations,
} from "@/lib/server/services/conversation.service";
import {
  getOrganizationMembers,
  getOrganizations,
} from "@/lib/server/services/organization.service";
import type { Conversation } from "@/types/conversation";
import type { OrganizationMember } from "@/types/member";

export default async function MessagesPage() {
  let conversations: Conversation[] = [];
  let members: OrganizationMember[] = [];
  let unreadCount = 0;
  let error: string | null = null;
  let selectedOrganizationId: string | null = null;
  let noOrganization = false;
  let currentMemberId: string | null = null;

  try {
    const [organizations, me] = await Promise.all([
      getOrganizations(),
      getCurrentUser().catch(() => null),
    ]);
    currentMemberId = me?.organizationMemberId ?? null;
    const selectedOrganization = await getSelectedOrganization(organizations);

    if (!selectedOrganization) {
      noOrganization = true;
    } else {
      selectedOrganizationId = selectedOrganization.id;
      const [conversationList, unread, orgMembers] = await Promise.all([
        listConversations(selectedOrganization.id),
        getConversationUnreadCount(selectedOrganization.id),
        getOrganizationMembers(selectedOrganization.id),
      ]);
      conversations = conversationList;
      unreadCount = unread.unreadCount;
      members = orgMembers.filter(
        (member) =>
          !currentMemberId ||
          member.id.toLowerCase() !== currentMemberId.toLowerCase()
      );
    }
  } catch (err) {
    if (err instanceof BackendApiError) {
      error = err.message;
    } else {
      error = "Failed to load messages.";
    }
  }

  if (noOrganization) {
    return (
      <NoOrganizationEmptyState
        title="Messages"
        description="Select an organization to view conversations."
      />
    );
  }

  if (!selectedOrganizationId) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-4 p-6">
      <MessagesPageContent
        organizationId={selectedOrganizationId}
        initialConversations={conversations}
        members={members}
        initialUnreadCount={unreadCount}
        loadError={error}
      />
    </div>
  );
}
