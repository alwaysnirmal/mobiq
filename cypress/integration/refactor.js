/// <reference types = "cypress"/>

context('API Tests for Checking Format of Email in comments of Posts by Particular UserID', () => {

    it('Get user details', () => {
        //requesting user info of all avaiable users
        cy.request('/users')
        .then((response) => {
            expect(response.status).to.eq(200);
            expect(response).to.have.property('headers')
            expect(response).to.have.property('duration')
            expect(response.body[0],'Userid is of Type Number').property('id').to.be.a('number');
            expect(response.body,'Lenght is correct').to.have.length(10);
            cy.writeFile('cypress/fixtures/userDetails.json',response.body);
            //retriving the object related to partocular user name and then finding the userid of particular user
        })
        //function to search Username
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
                    expect(commentResponse.body).to.have.length(5);
                    var commentsCount = Object.keys(commentResponse.body).length;
                    for(var x=0;x<commentsCount;x++){
                        cy.validateEmail(commentResponse.body[x].email)
                        .then((emailValidationResponse) => {
                            expect(emailValidationResponse).to.be.true;
                        });                          
                    }           
                });
            }
        }) 
    });
    
    it('Invalid Post ID',() => {
        cy.request('https://jsonplaceholder.typicode.com/comments?postId=101')
        .then((response) => {
            console.log(response)
            expect(response.status).to.eq(200);
            expect(response).to.have.property('headers')
            expect(response).to.have.property('duration')
            expect(response.body).to.have.length(0);

        })

    })
});

