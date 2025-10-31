import React from "react";
import FriendListItem from "./FriendListItem";

/**
 * FriendsList - Display list of friends
 */
export default function FriendsList({ friends = [], onRemoveFriend }) {
  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-3">👥</div>
        <div className="text-gray-600 font-medium mb-2">No friends yet</div>
        <div className="text-sm text-gray-500">
          Click "Add Friend" to connect with others
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((friend) => (
        <FriendListItem
          key={friend._id}
          friend={friend}
          onRemove={() => onRemoveFriend(friend._id)}
        />
      ))}
    </div>
  );
}
