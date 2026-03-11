import Map "mo:core/Map";
import Set "mo:core/Set";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Bool "mo:core/Bool";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Currency = {
    #usd;
    #eur;
    #gbp;
    #jpy;
    #other : Text;
  };

  type ProductCategory = {
    #cleanser;
    #serum;
    #moisturizer;
    #sunscreen;
    #exfoliator;
    #mask;
    #toner;
    #eyeTreatment;
    #other : Text;
  };

  module ProductCategory {
    public func compare(category1 : ProductCategory, category2 : ProductCategory) : Order.Order {
      switch (category1, category2) {
        case (#cleanser, #cleanser) { #equal };
        case (#serum, #serum) { #equal };
        case (#moisturizer, #moisturizer) { #equal };
        case (#sunscreen, #sunscreen) { #equal };
        case (#exfoliator, #exfoliator) { #equal };
        case (#mask, #mask) { #equal };
        case (#toner, #toner) { #equal };
        case (#eyeTreatment, #eyeTreatment) { #equal };
        case (#other(text1), #other(text2)) { Text.compare(text1, text2) };
        case (#cleanser, _) { #less };
        case (_, #cleanser) { #greater };
        case (#serum, _) { #less };
        case (_, #serum) { #greater };
        case (#moisturizer, _) { #less };
        case (_, #moisturizer) { #greater };
        case (#sunscreen, _) { #less };
        case (_, #sunscreen) { #greater };
        case (#exfoliator, _) { #less };
        case (_, #exfoliator) { #greater };
        case (#mask, _) { #less };
        case (_, #mask) { #greater };
        case (#toner, _) { #less };
        case (_, #toner) { #greater };
        case (#eyeTreatment, _) { #less };
        case (_, #eyeTreatment) { #greater };
        case (#other(_), _) { #less };
        case (_, #other(_)) { #greater };
      };
    };
  };

  type SkinType = {
    #oily;
    #dry;
    #combination;
    #sensitive;
    #normal;
  };

  type Price = {
    amount : Float;
    currency : Currency;
  };

  public type ProductId = Nat;

  public type Product = {
    id : ProductId;
    name : Text;
    brand : Text;
    category : ProductCategory;
    skinType : SkinType;
    keyIngredients : [Text];
    concerns : [Text];
    price : Price;
    description : Text;
    usageInstructions : Text;
    imageUrl : Text;
  };

  public type ProductFilter = {
    searchText : ?Text;
    category : ?ProductCategory;
    skinType : ?SkinType;
    concerns : ?Text;
    minPrice : ?Float;
    maxPrice : ?Float;
    currency : ?Currency;
  };

  public type ProductUpdate = {
    name : ?Text;
    brand : ?Text;
    category : ?ProductCategory;
    skinType : ?SkinType;
    keyIngredients : ?[Text];
    concerns : ?[Text];
    price : ?Price;
    description : ?Text;
    usageInstructions : ?Text;
    imageUrl : ?Text;
  };

  public type UserProfile = {
    name : Text;
    skinType : ?SkinType;
    skinConcerns : [Text];
  };

  var nextProductId = 1;
  var productCache = Map.empty<ProductId, Product>();
  var userProfiles = Map.empty<Principal, UserProfile>();

  // Include Authorization Mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public func initializeActor() : async () {};

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  func matchesCategory(product : Product, category : ProductCategory) : Bool {
    product.category == category;
  };

  func matchesSkinType(product : Product, skinType : SkinType) : Bool {
    product.skinType == skinType;
  };

  func containsConcerns(product : Product, concern : Text) : Bool {
    for (productConcern in product.concerns.values()) {
      if (productConcern.contains(#text concern)) {
        return true;
      };
    };
    false;
  };

  func matchesPriceRange(product : Product, minPrice : ?Float, maxPrice : ?Float) : Bool {
    switch (minPrice, maxPrice) {
      case (?min, ?max) { product.price.amount >= min and product.price.amount <= max };
      case (?min, null) { product.price.amount >= min };
      case (null, ?max) { product.price.amount <= max };
      case (null, null) { true };
    };
  };

  func allFiltersPass(product : Product, filters : ProductFilter) : Bool {
    let categoryMatch = switch (filters.category) {
      case (?category) { matchesCategory(product, category) };
      case (null) { true };
    };

    let skinTypeMatch = switch (filters.skinType) {
      case (?skinType) { matchesSkinType(product, skinType) };
      case (null) { true };
    };

    let concernMatch = switch (filters.concerns) {
      case (?concern) { containsConcerns(product, concern) };
      case (null) { true };
    };

    let priceMatch = matchesPriceRange(product, filters.minPrice, filters.maxPrice);

    categoryMatch and skinTypeMatch and concernMatch and priceMatch;
  };

  func sortProductsByPrice(products : [Product]) : [Product] {
    products.sort(
      func(p1, p2) {
        Float.compare(
          p1.price.amount, p2.price.amount,
        );
      }
    );
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management - Requires authenticated user (not just admin)
  public shared ({ caller }) func addProduct(product : Product) : async ProductId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create products");
    };

    let id = nextProductId;
    nextProductId += 1;

    let newProduct = {
      id = id;
      name = product.name;
      brand = product.brand;
      category = product.category;
      skinType = product.skinType;
      keyIngredients = product.keyIngredients;
      concerns = product.concerns;
      price = product.price;
      description = product.description;
      usageInstructions = product.usageInstructions;
      imageUrl = product.imageUrl;
    };

    productCache.add(id, newProduct);
    id;
  };

  public shared ({ caller }) func updateProduct(id : ProductId, productUpdate : ProductUpdate) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update products");
    };

    if (not productCache.containsKey(id)) {
      Runtime.trap("Product not found for update");
    };

    let existingProduct = switch (productCache.get(id)) {
      case (null) { Runtime.trap("Internal error: Product should exist for update") };
      case (?product) { product };
    };

    let updatedProduct = {
      id = existingProduct.id;
      name = switch (productUpdate.name) {
        case (?name) { name };
        case (null) { existingProduct.name };
      };
      brand = switch (productUpdate.brand) {
        case (?brand) { brand };
        case (null) { existingProduct.brand };
      };
      category = switch (productUpdate.category) {
        case (?category) { category };
        case (null) { existingProduct.category };
      };
      skinType = switch (productUpdate.skinType) {
        case (?skinType) { skinType };
        case (null) { existingProduct.skinType };
      };
      keyIngredients = switch (productUpdate.keyIngredients) {
        case (?keyIngredients) { keyIngredients };
        case (null) { existingProduct.keyIngredients };
      };
      concerns = switch (productUpdate.concerns) {
        case (?concerns) { concerns };
        case (null) { existingProduct.concerns };
      };
      price = switch (productUpdate.price) {
        case (?price) { price };
        case (null) { existingProduct.price };
      };
      description = switch (productUpdate.description) {
        case (?description) { description };
        case (null) { existingProduct.description };
      };
      usageInstructions = switch (productUpdate.usageInstructions) {
        case (?usageInstructions) { usageInstructions };
        case (null) { existingProduct.usageInstructions };
      };
      imageUrl = switch (productUpdate.imageUrl) {
        case (?imageUrl) { imageUrl };
        case (null) { existingProduct.imageUrl };
      };
    };

    productCache.add(id, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(id : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete products");
    };

    switch (productCache.get(id)) {
      case (null) { Runtime.trap("Product not found for deletion") };
      case (_) {
        productCache.remove(id);
      };
    };
  };

  // Public read-only endpoints - No authentication required (browsing allowed for all)
  public query func getProductById(id : ProductId) : async ?Product {
    productCache.get(id);
  };

  public query ({ caller }) func filterProducts(filters : ProductFilter) : async [Product] {
    let filteredProducts = productCache.values().toArray().filter(
      func(product) { allFiltersPass(product, filters) }
    );
    sortProductsByPrice(filteredProducts);
  };

  public shared ({ caller }) func getAllCategories() : async [ProductCategory] {
    var categories = Set.empty<ProductCategory>();

    for (product in productCache.values()) {
      categories.add(product.category);
    };

    categories.values().toArray();
  };

  // Admin-only destructive operation
  public shared ({ caller }) func resetProducts() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset all products");
    };
    productCache.clear();
    nextProductId := 1;
  };
};
