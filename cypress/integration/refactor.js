/// <reference types = "cypress"/>

context('API Tests for Checking Format of Email in comments of Posts by Particular UserID', () => {

    it('Get User details', () => {
        //requesting user info of all avaiable users
        cy.request('/users')
        .then((response) => {
            expect(response.status).to.eq(200);
            expect(response).to.have.property('headers')
            expect(response).to.have.property('duration').and.be.a('number')
            expect(response.body[0],'Userid is of Type Number').property('id').to.be.a('number');
            expect(response.headers).to.have.property('content-type').to.contain('application/json; charset=utf-8');
            expect(response.body,'Number of Users are 10').to.have.length(10);
           
            //Storing Data in User file to be used afterwards
            cy.writeFile('cypress/fixtures/userDetails.json',response.body);
            
        })
        //function to search Username and retreive UserID
        cy.findUser('Delphine').then((userID) => {
                 cy.wrap(userID).as('userId')
        });
    })

    it('Get All posts of particular userid' ,function () {
       // API request for retriving posts related to user derived in previous test
        cy.request({
            url:'/posts',
            qs: {
                userId:this.userId,
                },
            })
        .then(function (response)  {
            expect(response.status).to.eq(200);
            expect(response).to.have.property('headers')
            expect(response).to.have.property('duration')
            //Asserting that Number of Posts by particular user is 10
            expect(response.body).to.have.length(10);
            //storing the response in fixture file to be used in other parts of tests
            cy.writeFile('cypress/fixtures/posts.json',response.body);
       
        });
    });    

    it('Get comments from each post and Validate Email Address',function () {
      
        //retriving the fixture file stored in previous test blocks
        cy.fixture('posts').then((posts) => {      
           //cy.log(posts);
            for (var i of posts){    
                cy.request('/comments?postId='+i.id)
                .then((commentResponse) => {
                    expect(commentResponse.body,'Comments count per post is 5').to.have.length(5);
                    var commentsCount = Object.keys(commentResponse.body).length;
                    for(var x=0;x<commentsCount;x++){
                        cy.validateEmail(commentResponse.body[x].email)
                        .then((emailValidationResponse) => {
                            expect(emailValidationResponse,'Email is of Correct Format').to.be.true;
                        });                          
                    }           
                });
            }
        }) 
    });
    
    it('Invalid Post ID',() => {
        //PostID 101 does not exist , Empty array should be retrieved 
        cy.request('/comments?postId=101')
        .then((response) => {
            expect(response).to.have.property('headers')
            expect(response).to.have.property('duration')
            expect(response.body,'Empty Array is returned').to.have.length(0);

        })

    })

    it('InValid User Id while retrieving the Posts based on UserID' ,() => {
        cy.request('/posts?userId=1001')
        .then((response) => {
            expect(response.body,'Empty Array is returned').to.have.length(0);
        })
    })

});

