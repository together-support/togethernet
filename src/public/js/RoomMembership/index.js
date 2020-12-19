import store from '@js/store';

class RoomMembership {
  constructor (roomId) {
    this.roomId = roomId;
    this.members = {};
  }

  addMember = (member) => {
    const {socketId} = member;
    Object.values(store.get('rooms')).forEach(room => room.memberships.removeMember(socketId));
    member.state.currentRoomId = this.roomId;
    this.members[socketId] = member;
    member.render();
    member.renderParticipantAvatar();
  }

  renderAvatars = () => {
    Object.values(this.members).forEach(member => {
      member.currentRoomId = this.roomId;
      member.render();
    });
  }

  removeMember = (socketId) => {
    delete this.members[socketId]
  }
}

export default RoomMembership;