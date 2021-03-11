pragma solidity ^0.5.0;


// store the video
// upload the video
// list videos

contract DVideo {
  uint public videoCount = 0;
  string public name = "DVideo";

  // model the video
  struct Video {
    uint id;
    string hash;
    string title;
    address author;
  }

  mapping(uint => Video) public videos;

  //Create Event
  event VideoUploaded(uint id, string hash, string title, address author);

  constructor() public {
  }

  modifier hasValidHash(string memory _videoHash) {
    require(bytes(_videoHash).length > 0);
    _;
  }

  modifier hasValidTitle(string memory _title) {
    require(bytes(_title).length > 0);
    _;
  }

  modifier hasValidAuthor() {
    require(msg.sender != address(0));
    _;
  }

  function uploadVideo(string memory _videoHash, string memory _title) public 
  hasValidHash(_videoHash) hasValidTitle(_title) hasValidAuthor()
  {
    // Make sure the video hash exists

    // Make sure video title exists

    // Make sure uploader address exists


    // Increment video id
    videoCount++;

    // Add video to the contract
    videos[videoCount] = Video(videoCount, _videoHash, _title, msg.sender);

    // Trigger an event
    emit VideoUploaded(videoCount, _videoHash, _title, msg.sender);
  }
}
