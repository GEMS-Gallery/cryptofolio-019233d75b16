import Hash "mo:base/Hash";

import Array "mo:base/Array";
import Float "mo:base/Float";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

actor {
  // Type definitions
  type TokenInfo = {
    name: Text;
    symbol: Text;
    balance: Float;
    price: Float;
  };

  // Stable variables for persistence
  stable var userDataEntries : [(Principal, [(Text, TokenInfo)])] = [];

  // HashMap to store user data
  var userData = HashMap.HashMap<Principal, HashMap.HashMap<Text, TokenInfo>>(10, Principal.equal, Principal.hash);

  // Initialize userData from stable storage
  system func preupgrade() {
    userDataEntries := [];
    for (entry in userData.entries()) {
      let (principal, tokenMap) = entry;
      let tokenEntries = Iter.toArray(tokenMap.entries());
      userDataEntries := Array.append(userDataEntries, [(principal, tokenEntries)]);
    };
  };

  system func postupgrade() {
    userData := HashMap.HashMap<Principal, HashMap.HashMap<Text, TokenInfo>>(10, Principal.equal, Principal.hash);
    for ((principal, tokens) in userDataEntries.vals()) {
      let tokenMap = HashMap.HashMap<Text, TokenInfo>(10, Text.equal, Text.hash);
      for ((symbol, info) in tokens.vals()) {
        tokenMap.put(symbol, info);
      };
      userData.put(principal, tokenMap);
    };
  };

  // Add or update token information for a user
  public shared(msg) func updateTokenInfo(symbol: Text, name: Text, balance: Float, price: Float) : async () {
    let caller = msg.caller;
    let userTokens = switch (userData.get(caller)) {
      case null {
        let newMap = HashMap.HashMap<Text, TokenInfo>(10, Text.equal, Text.hash);
        userData.put(caller, newMap);
        newMap
      };
      case (?existingMap) { existingMap };
    };

    userTokens.put(symbol, { name; symbol; balance; price });
  };

  // Get all tokens for a user
  public shared(msg) func getTokens() : async [(Text, TokenInfo)] {
    let caller = msg.caller;
    switch (userData.get(caller)) {
      case null { [] };
      case (?userTokens) {
        Iter.toArray(userTokens.entries())
      };
    };
  };

  // Calculate total portfolio value
  public shared(msg) func getTotalValue() : async Float {
    let caller = msg.caller;
    switch (userData.get(caller)) {
      case null { 0 };
      case (?userTokens) {
        var total : Float = 0;
        for ((_, info) in userTokens.entries()) {
          total += info.balance * info.price;
        };
        total
      };
    };
  };
};
