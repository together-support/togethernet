class RoomMembership {
  constructor () {
    this.members = {};
  }

  addMember = (member) => {
    const {socketId} = member;
    Object.values(store.get('rooms')).forEach(room => delete room.members[socketId]);
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
}

export default RoomMembership;