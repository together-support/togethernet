class ArchivalSpace {
  constructor () {
    this.messageRecords = [];
  }

  fetchArchivedMessages = async () => {
    const response = await fetch('/archive', {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });

    // const messages = await response.json(); 
    console.log(response);
  }

  render () {
    this.messageRecords.forEach((messageRecord) => {

    });
  }
}

export default ArchivalSpace;